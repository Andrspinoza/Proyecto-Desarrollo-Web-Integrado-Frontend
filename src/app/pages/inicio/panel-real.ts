import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

interface MeetupApi {
  id: number; title: string; description: string; type: string; scheduledAt: string;
  capacity: number; availableSpots: number; status: string; place?: { name?: string; address?: string };
}
interface ConexionApi { id: number; requesterId: number; status: string }

@Component({
  selector: 'app-panel-real',
  imports: [DatePipe],
  template: `
    <div class="max-w-[1200px] mx-auto">
      <h1 class="font-headline-page text-headline-page text-on-surface mb-2">Hola, {{ nombre() }}</h1>
      <p class="text-text-secondary mb-6">Tu comunidad universitaria, en un solo lugar.</p>
      @if (error()) { <div role="alert" class="bg-error-container text-error p-4 rounded-xl mb-4">{{ error() }}</div> }
      <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <section class="bg-surface rounded-xl p-6 border border-border-base">
          <h2 class="font-headline-section text-headline-section text-on-surface mb-4">Meetups disponibles</h2>
          @if (cargandoMeetups()) { <p>Buscando meetups…</p> }
          @else if (meetups().length === 0) { <p class="text-text-secondary">Todavía no hay meetups disponibles.</p> }
          @for (m of meetups(); track m.id) {
            <article class="border border-border-base rounded-xl p-4 mb-3">
              <span class="text-primary font-bold text-sm">{{ m.type === 'ACADEMIC' ? 'ACADÉMICO' : 'SOCIAL' }}</span>
              <h3 class="font-bold text-on-surface text-lg mt-1">{{ m.title }}</h3>
              <p class="text-text-secondary">{{ m.description }}</p>
              <p class="text-text-secondary text-sm mt-2">{{ m.scheduledAt | date:'dd/MM/yyyy HH:mm' }} · {{ m.availableSpots }} cupos disponibles</p>
              <button type="button" (click)="solicitar(m.id)" [disabled]="ocupado()" class="mt-3 rounded-lg bg-primary text-on-primary px-4 py-2 cursor-pointer disabled:opacity-50">Solicitar participación</button>
            </article>
          }
        </section>
        <aside class="bg-surface rounded-xl p-6 border border-border-base h-fit">
          <h2 class="font-headline-section text-headline-section text-on-surface mb-4">Solicitudes recibidas</h2>
          @if (cargandoSolicitudes()) { <p>Cargando solicitudes…</p> }
          @else if (solicitudes().length === 0) { <p class="text-text-secondary">No tienes solicitudes pendientes.</p> }
          @for (s of solicitudes(); track s.id) {
            <article class="border border-border-base rounded-xl p-3 mb-3">
              <p class="text-on-surface">Estudiante #{{ s.requesterId }}</p>
              <div class="flex gap-2 mt-2"><button type="button" (click)="responder(s.id, 'accept')" [disabled]="ocupado()" class="text-primary font-bold cursor-pointer">Aceptar</button><button type="button" (click)="responder(s.id, 'reject')" [disabled]="ocupado()" class="text-text-secondary cursor-pointer">Rechazar</button></div>
            </article>
          }
        </aside>
      </div>
      @if (aviso()) { <p role="status" class="text-primary mt-4">{{ aviso() }}</p> }
      <p class="text-text-secondary text-sm mt-6">Las demás pantallas de la aplicación están en integración con la API de este curso.</p>
    </div>
  `,
})
export class PanelReal implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  protected readonly meetups = signal<MeetupApi[]>([]);
  protected readonly solicitudes = signal<ConexionApi[]>([]);
  protected readonly cargandoMeetups = signal(true);
  protected readonly cargandoSolicitudes = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected nombre(): string { return this.auth.usuario()?.nombres ?? 'estudiante'; }
  ngOnInit(): void { this.cargarMeetups(); this.cargarSolicitudes(); }
  private cargarMeetups(): void {
    this.http.get<MeetupApi[]>(`${environment.apiUrl}/meetups`).subscribe({
      next: (lista) => { this.meetups.set(lista.filter((m) => m.status === 'SCHEDULED')); this.cargandoMeetups.set(false); },
      error: () => { this.cargandoMeetups.set(false); this.error.set('No se pudieron cargar los meetups. Inténtalo de nuevo.'); },
    });
  }
  private cargarSolicitudes(): void {
    this.http.get<ConexionApi[]>(`${environment.apiUrl}/connections/received`).subscribe({
      next: (lista) => { this.solicitudes.set(lista.filter((s) => s.status === 'PENDING')); this.cargandoSolicitudes.set(false); },
      error: () => { this.cargandoSolicitudes.set(false); this.error.set('No se pudieron cargar las solicitudes. Inténtalo de nuevo.'); },
    });
  }
  protected solicitar(id: number): void {
    this.ocupado.set(true); this.aviso.set(null); this.error.set(null);
    this.http.post(`${environment.apiUrl}/meetups/${id}/participations`, {}).subscribe({
      next: () => { this.ocupado.set(false); this.aviso.set('Solicitud enviada.'); this.cargarMeetups(); },
      error: () => { this.ocupado.set(false); this.error.set('No se pudo enviar la solicitud. Comprueba los cupos y el estado del meetup.'); },
    });
  }
  protected responder(id: number, accion: 'accept' | 'reject'): void {
    this.ocupado.set(true); this.error.set(null);
    this.http.patch(`${environment.apiUrl}/connections/${id}/${accion}`, {}).subscribe({
      next: () => { this.ocupado.set(false); this.cargarSolicitudes(); },
      error: () => { this.ocupado.set(false); this.error.set('No se pudo responder la solicitud.'); },
    });
  }
}
