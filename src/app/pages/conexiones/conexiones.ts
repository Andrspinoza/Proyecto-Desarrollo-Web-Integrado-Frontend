import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';

interface ConexionApi {
  id: number;
  requesterId: number;
  recipientId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

interface EstudianteApi { firstName?: string; lastName?: string }
interface ConexionVista extends ConexionApi { nombre: string; otroId: number }
type Vista = 'recibidas' | 'enviadas' | 'aceptadas';
type Accion = 'accept' | 'reject' | 'cancel';

@Component({
  selector: 'app-conexiones-reales',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="max-w-[1000px] mx-auto">
      <h1 class="font-headline-page text-headline-page text-on-surface mb-2">Tus conexiones</h1>
      <p class="text-text-secondary mb-6">Revisa tus solicitudes y las personas con quienes ya conectaste.</p>
      <form (ngSubmit)="enviar()" class="bg-surface rounded-xl p-4 border border-border-base mb-5">
        <label for="destinatario" class="block font-bold mb-2">Enviar solicitud por ID de estudiante</label>
        <p class="text-text-secondary text-sm mb-2">Mientras terminamos la búsqueda, pide a tu compañero su ID de estudiante.</p>
        <p class="text-text-secondary text-sm mb-2">Tu ID de estudiante: {{ auth.usuario()?.estudianteId }}</p>
        <div class="flex gap-2"><input id="destinatario" name="destinatario" type="number" min="1" required [(ngModel)]="destinatario" class="border border-border-base rounded-lg p-2" />
        <button type="submit" [disabled]="ocupado() || !destinatario" class="rounded-lg bg-primary text-on-primary px-4 py-2 disabled:opacity-50">Enviar solicitud</button></div>
      </form>
      <div class="flex flex-wrap gap-2 mb-5" aria-label="Tipos de conexiones">
        @for (opcion of opciones; track opcion.id) {
          <button type="button" (click)="elegir(opcion.id)" [attr.aria-pressed]="vista() === opcion.id"
            class="px-4 py-2 rounded-xl cursor-pointer border border-border-base"
            [class.bg-primary]="vista() === opcion.id" [class.text-on-primary]="vista() === opcion.id"
            [class.bg-surface]="vista() !== opcion.id">{{ opcion.texto }}</button>
        }
      </div>
      @if (error()) { <div role="alert" class="bg-error-container text-error p-4 rounded-xl mb-4">{{ error() }}</div> }
      @if (aviso()) { <p role="status" class="text-primary mb-4">{{ aviso() }}</p> }
      <div class="bg-surface rounded-xl p-6 border border-border-base">
        @if (cargando()) { <p>Cargando conexiones…</p> }
        @else if (conexiones().length === 0 && !error()) { <p class="text-text-secondary">{{ vacio() }}</p> }
        @for (conexion of conexiones(); track conexion.id) {
          <article class="border border-border-base rounded-xl p-4 mb-3 flex flex-wrap justify-between gap-4 items-center">
            <div>
              <h2 class="font-bold text-on-surface text-lg">{{ conexion.nombre }}</h2>
              <p class="text-text-secondary text-sm">{{ conexion.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <div class="flex gap-2 flex-wrap">
              @if (vista() === 'recibidas') {
                <button type="button" (click)="responder(conexion.id, 'accept')" [disabled]="ocupado()" class="rounded-lg bg-primary text-on-primary px-4 py-2 cursor-pointer disabled:opacity-50">Aceptar</button>
                <button type="button" (click)="responder(conexion.id, 'reject')" [disabled]="ocupado()" class="rounded-lg border border-border-base px-4 py-2 cursor-pointer disabled:opacity-50">Rechazar</button>
              }
              @if (vista() === 'enviadas') {
                <button type="button" (click)="responder(conexion.id, 'cancel')" [disabled]="ocupado()" class="rounded-lg border border-border-base px-4 py-2 cursor-pointer disabled:opacity-50">Cancelar solicitud</button>
              }
            </div>
          </article>
        }
      </div>
      <p class="text-text-secondary text-sm mt-6">La búsqueda de estudiantes y las recomendaciones aún están en desarrollo.</p>
    </section>
  `,
})
export class ConexionesReales implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly auth = inject(AuthService);
  protected readonly opciones: { id: Vista; texto: string }[] = [
    { id: 'recibidas', texto: 'Recibidas' }, { id: 'enviadas', texto: 'Enviadas' }, { id: 'aceptadas', texto: 'Conexiones' },
  ];
  protected readonly vista = signal<Vista>('recibidas');
  protected readonly conexiones = signal<ConexionVista[]>([]);
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  private solicitudActual = 0;
  protected destinatario: number | null = null;

  protected enviar(): void {
    const id = this.destinatario;
    if (!id || !Number.isInteger(id) || id < 1 || this.ocupado()) return;
    this.ocupado.set(true); this.error.set(null); this.aviso.set(null);
    this.http.post(`${environment.apiUrl}/connections`, { recipientId: id }).subscribe({
      next: () => { this.ocupado.set(false); this.destinatario = null; this.aviso.set('Solicitud enviada.'); this.vista.set('enviadas'); this.cargar(); },
      error: () => { this.ocupado.set(false); this.error.set('No se pudo enviar la solicitud. Comprueba el ID y que el estudiante pertenezca a tu universidad.'); },
    });
  }

  ngOnInit(): void { this.cargar(); }

  protected elegir(vista: Vista): void { this.vista.set(vista); this.aviso.set(null); this.cargar(); }

  protected vacio(): string {
    return this.vista() === 'recibidas' ? 'No tienes solicitudes pendientes.' :
      this.vista() === 'enviadas' ? 'No has enviado solicitudes pendientes.' : 'Todavía no tienes conexiones aceptadas.';
  }

  protected responder(id: number, accion: Accion): void {
    if (this.ocupado()) return;
    this.ocupado.set(true); this.error.set(null); this.aviso.set(null);
    this.http.patch(`${environment.apiUrl}/connections/${id}/${accion}`, {}).subscribe({
      next: () => { this.ocupado.set(false); this.aviso.set(accion === 'accept' ? 'Conexión aceptada.' : accion === 'reject' ? 'Solicitud rechazada.' : 'Solicitud cancelada.'); this.cargar(); },
      error: () => { this.ocupado.set(false); this.error.set('No se pudo actualizar la solicitud. Inténtalo de nuevo.'); },
    });
  }

  private cargar(): void {
    const version = ++this.solicitudActual;
    const estudianteId = this.auth.usuario()?.estudianteId;
    if (!estudianteId) { this.error.set('No se pudo identificar la cuenta. Inicia sesión nuevamente.'); this.cargando.set(false); return; }
    this.cargando.set(true); this.error.set(null); this.conexiones.set([]);
    const ruta = this.vista() === 'recibidas' ? '/connections/received' :
      this.vista() === 'enviadas' ? '/connections/sent' : '/connections?status=ACCEPTED';
    this.http.get<ConexionApi[]>(`${environment.apiUrl}${ruta}`).pipe(
      switchMap((lista) => {
        if (!lista.length) return of([] as ConexionVista[]);
        return forkJoin(lista.map((conexion) => {
          const otroId = conexion.requesterId === estudianteId ? conexion.recipientId : conexion.requesterId;
          return this.http.get<EstudianteApi>(`${environment.apiUrl}/students/${otroId}`).pipe(
            map((perfil) => ({ ...conexion, otroId, nombre: [perfil.firstName, perfil.lastName].filter(Boolean).join(' ') || `Estudiante #${otroId}` })),
            catchError(() => of({ ...conexion, otroId, nombre: `Estudiante #${otroId}` })),
          );
        }));
      }),
    ).subscribe({
      next: (lista) => { if (version === this.solicitudActual) { this.conexiones.set(lista); this.cargando.set(false); } },
      error: () => { if (version === this.solicitudActual) { this.cargando.set(false); this.error.set('No se pudieron cargar las conexiones. Inténtalo de nuevo.'); } },
    });
  }
}
