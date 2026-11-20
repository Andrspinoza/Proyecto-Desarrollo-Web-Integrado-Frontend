import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { ConexionApi, ItemCatalogo } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PersonasService } from '../../core/personas.service';
import { Avatar } from '../../ui/avatar';
import { Modal } from '../../ui/modal';

const MOTIVOS = [
  { valor: 'INAPPROPRIATE_CONTENT', texto: 'Contenido inapropiado' },
  { valor: 'FAKE_PROFILE', texto: 'Perfil falso' },
  { valor: 'HARASSMENT', texto: 'Acoso' },
  { valor: 'SPAM', texto: 'Spam' },
  { valor: 'OTHER', texto: 'Otro' },
];

@Component({
  selector: 'app-persona',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Modal],
  template: `
    <a routerLink="/descubrir" class="inline-flex items-center gap-1 text-sm font-bold text-muted no-underline mb-3"><span class="icon !text-[18px]">arrow_back</span> Volver</a>

    @if (cargando()) { <div class="card p-10 text-center text-muted">Cargando perfil…</div> }
    @else if (!persona()) { <div class="card p-10 text-center"><p class="m-0 text-muted">No encontramos a esta persona o no puedes verla.</p></div> }
    @else if (persona(); as p) {
      <article class="card overflow-hidden max-w-3xl mx-auto">
        <div class="bg-gradient-to-br from-brand-soft to-[#f5f3f8] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
          <span class="rounded-full ring-[6px] ring-white shadow-lg"><app-avatar [foto]="p.photoUrl" [genero]="p.profile?.gender ?? null" [nombre]="p.firstName" [tam]="132" /></span>
          <div class="text-center sm:text-left flex-1 min-w-0">
            <h1 class="font-display font-extrabold text-3xl m-0">{{ p.firstName }} {{ p.lastName }}@if (p.profile?.age != null) {<span class="font-semibold text-muted">, {{ p.profile?.age }}</span>}</h1>
            @if (p.profile) {
              <p class="text-muted font-semibold mt-1 mb-0">{{ p.profile.career }} · ciclo {{ p.profile.cycle }}</p>
              @if (p.profile.campus) { <p class="text-sm text-muted mt-0.5 mb-0">{{ p.profile.campus }}</p> }
            }
          </div>
        </div>
        <div class="p-5 sm:p-8">
          @if (p.profile?.visibility == null) {
            <p class="text-muted m-0 flex items-center gap-2"><span class="icon">lock</span> Este perfil es privado. Conecta para ver más.</p>
          } @else {
            @if (p.profile?.description) { <p class="m-0 leading-relaxed">{{ p.profile?.description }}</p> }
            @if (nombresIntereses().length > 0) {
              <h2 class="font-display text-base font-bold mt-5 mb-2">Intereses</h2>
              <div class="flex flex-wrap gap-2">@for (i of nombresIntereses(); track i) { <span class="chip chip-on">{{ i }}</span> }</div>
            }
            @if (nombresHabilidades().length > 0) {
              <h2 class="font-display text-base font-bold mt-5 mb-2">Habilidades</h2>
              <div class="flex flex-wrap gap-2">@for (h of nombresHabilidades(); track h) { <span class="chip">{{ h }}</span> }</div>
            }
          }

          <div class="flex flex-col sm:flex-row gap-2 mt-7">
            @switch (estado()) {
              @case ('conectados') {
                <a [routerLink]="['/mensajes']" [queryParams]="{ con: p.id }" class="btn btn-primary flex-1"><span class="icon">chat</span> Enviar mensaje</a>
                <a routerLink="/planes" class="btn btn-ghost flex-1"><span class="icon">event</span> Proponer un plan</a>
              }
              @case ('enviada') { <button type="button" class="btn btn-ghost flex-1" [disabled]="ocupado()" (click)="cancelar()">Solicitud enviada · Cancelar</button> }
              @case ('recibida') {
                <button type="button" class="btn btn-primary flex-1" [disabled]="ocupado()" (click)="aceptar()"><span class="icon icon-fill">favorite</span> Aceptar conexión</button>
                <button type="button" class="btn btn-ghost flex-1" [disabled]="ocupado()" (click)="rechazar()">Rechazar</button>
              }
              @default { <button type="button" class="btn btn-primary flex-1" [disabled]="ocupado()" (click)="conectar()"><span class="icon icon-fill">favorite</span> Me interesa conectar</button> }
            }
          </div>
          <div class="flex gap-4 mt-5 text-sm font-bold">
            <button type="button" class="bg-transparent border-0 p-0 text-muted cursor-pointer" (click)="modal.set('reporte')"><span class="icon !text-[18px] align-middle">flag</span> Reportar</button>
            <button type="button" class="bg-transparent border-0 p-0 text-danger cursor-pointer" (click)="modal.set('bloqueo')"><span class="icon !text-[18px] align-middle">block</span> Bloquear</button>
          </div>
        </div>
      </article>

      @if (modal() === 'bloqueo') {
        <app-modal titulo="Bloquear" (cerrar)="modal.set(null)">
          <p class="m-0 text-muted">{{ p.firstName }} dejará de aparecer en tus sugerencias y conexiones, y no podrán escribirse. Puedes desbloquear desde tu perfil.</p>
          <div class="flex gap-2 mt-5"><button type="button" class="btn btn-ghost flex-1" (click)="modal.set(null)">Cancelar</button><button type="button" class="btn btn-danger flex-1" [disabled]="ocupado()" (click)="bloquear()">Bloquear</button></div>
        </app-modal>
      }
      @if (modal() === 'reporte') {
        <app-modal titulo="Reportar a {{ p.firstName }}" (cerrar)="modal.set(null)">
          <label class="label" for="motivo">Motivo</label>
          <select id="motivo" class="field" [value]="motivo()" (change)="motivo.set($any($event.target).value)">@for (m of motivos; track m.valor) { <option [value]="m.valor">{{ m.texto }}</option> }</select>
          <label class="label mt-4" for="detalle">Detalle (opcional)</label>
          <textarea id="detalle" class="field" maxlength="500" [value]="detalle()" (input)="detalle.set($any($event.target).value)"></textarea>
          <div class="flex gap-2 mt-5"><button type="button" class="btn btn-ghost flex-1" (click)="modal.set(null)">Cancelar</button><button type="button" class="btn btn-primary flex-1" [disabled]="ocupado()" (click)="reportar()">Enviar reporte</button></div>
        </app-modal>
      }
    }
  `,
})
export class Persona implements OnInit {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);
  private readonly personas = inject(PersonasService);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly conexion = signal<ConexionApi | null>(null);
  protected readonly intereses = signal<ItemCatalogo[]>([]);
  protected readonly habilidades = signal<ItemCatalogo[]>([]);
  protected readonly modal = signal<'bloqueo' | 'reporte' | null>(null);
  protected readonly motivo = signal('INAPPROPRIATE_CONTENT');
  protected readonly detalle = signal('');
  protected readonly motivos = MOTIVOS;

  protected readonly persona = computed(() => this.personas.personas().get(this.id) ?? null);
  protected readonly nombresIntereses = computed(() => this.nombres(this.persona()?.profile?.interestIds ?? [], this.intereses()));
  protected readonly nombresHabilidades = computed(() => this.nombres(this.persona()?.profile?.skillIds ?? [], this.habilidades()));
  protected readonly estado = computed<'ninguna' | 'enviada' | 'recibida' | 'conectados'>(() => {
    const c = this.conexion();
    if (c === null) return 'ninguna';
    if (c.status === 'ACCEPTED') return 'conectados';
    if (c.status === 'PENDING') return c.requesterId === this.auth.yo()?.id ? 'enviada' : 'recibida';
    return 'ninguna';
  });

  ngOnInit(): void {
    if (!Number.isFinite(this.id) || this.id <= 0) {
      this.cargando.set(false);
      return;
    }
    forkJoin({ i: this.api.intereses(), h: this.api.habilidades() }).subscribe({ next: ({ i, h }) => { this.intereses.set(i); this.habilidades.set(h); }, error: () => undefined });
    this.personas.cargar([this.id]).subscribe(() => this.cargando.set(false));
    this.refrescarConexion();
  }

  private nombres(ids: number[], catalogo: ItemCatalogo[]): string[] {
    return ids.map((id) => catalogo.find((c) => c.id === id)?.name).filter((n): n is string => !!n);
  }

  private refrescarConexion(): void {
    forkJoin({ todas: this.api.conexiones(), recibidas: this.api.recibidas(), enviadas: this.api.enviadas() }).subscribe({
      next: ({ todas, recibidas, enviadas }) => {
        const otra = (c: ConexionApi) => c.requesterId === this.id || c.recipientId === this.id;
        this.conexion.set([...todas, ...recibidas, ...enviadas].find((c) => otra(c) && (c.status === 'ACCEPTED' || c.status === 'PENDING')) ?? null);
      },
      error: () => undefined,
    });
  }

  private ejecutar(accion: () => ReturnType<Api['conectar']>, ok: string): void {
    this.ocupado.set(true);
    accion().subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok(ok);
        this.refrescarConexion();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected conectar(): void { this.ejecutar(() => this.api.conectar(this.id), 'Solicitud enviada.'); }
  protected cancelar(): void { const c = this.conexion(); if (c) this.ejecutar(() => this.api.cancelar(c.id), 'Solicitud cancelada.'); }
  protected aceptar(): void { const c = this.conexion(); if (c) this.ejecutar(() => this.api.aceptar(c.id), 'Conexión aceptada.'); }
  protected rechazar(): void { const c = this.conexion(); if (c) this.ejecutar(() => this.api.rechazar(c.id), 'Solicitud rechazada.'); }

  protected bloquear(): void {
    this.ocupado.set(true);
    this.api.bloquear(this.id).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok('Persona bloqueada.');
        void this.router.navigate(['/descubrir']);
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected reportar(): void {
    this.ocupado.set(true);
    this.api.reportar(this.id, this.motivo(), this.detalle().trim()).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.modal.set(null);
        this.avisos.ok('Gracias. Revisaremos tu reporte.');
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }
}
