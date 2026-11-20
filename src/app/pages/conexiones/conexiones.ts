import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { ConexionApi } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PersonasService } from '../../core/personas.service';
import { TiempoReal } from '../../core/tiempo-real.service';
import { Avatar } from '../../ui/avatar';

type Pestana = 'recibidas' | 'enviadas' | 'conectados';

@Component({
  selector: 'app-conexiones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, Avatar],
  template: `
    <div class="max-w-3xl mx-auto">
      <h1 class="font-display font-extrabold text-3xl m-0">Conexiones</h1>
      <p class="text-muted mt-1 mb-5">Solo cuando los dos aceptan pueden conversar y proponer un plan.</p>

      <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#ece7f1] mb-5" role="tablist">
        @for (p of pestanas; track p.id) {
          <button type="button" role="tab" [attr.aria-selected]="pestana() === p.id" class="btn !min-h-10 !px-2 border-0 !text-[13px] sm:!text-sm" [class.btn-primary]="pestana() === p.id" [class.!bg-transparent]="pestana() !== p.id" [class.btn-ghost]="pestana() !== p.id" (click)="pestana.set(p.id)">
            {{ p.texto }}@if (cuenta(p.id) > 0) { <span class="min-w-5 h-5 px-1 rounded-full text-[11px] flex items-center justify-center" [class.bg-white]="pestana() === p.id" [class.text-brand]="pestana() === p.id" [class.bg-brand]="pestana() !== p.id" [class.text-white]="pestana() !== p.id">{{ cuenta(p.id) }}</span> }
          </button>
        }
      </div>

      @if (cargando()) { <div class="card p-8 text-center text-muted">Cargando…</div> }
      @else if (actuales().length === 0) {
        <div class="card p-8 text-center">
          <span class="icon text-brand !text-[40px]">{{ pestana() === 'recibidas' ? 'inbox' : pestana() === 'enviadas' ? 'send' : 'group' }}</span>
          <p class="font-display text-lg font-bold mt-2 mb-1">{{ vacio().titulo }}</p>
          <p class="text-muted m-0">{{ vacio().texto }}</p>
          <a routerLink="/descubrir" class="btn btn-primary mt-5">Descubrir gente</a>
        </div>
      } @else {
        <ul class="list-none p-0 m-0 space-y-3">
          @for (c of actuales(); track c.id) {
            <li class="card p-3 sm:p-4 flex items-center gap-3 rise">
              <a [routerLink]="['/personas', otro(c)]" class="shrink-0"><app-avatar [foto]="personas.de(otro(c))?.photoUrl ?? null" [genero]="personas.de(otro(c))?.profile?.gender ?? null" [nombre]="personas.nombre(otro(c))" [tam]="56" /></a>
              <div class="min-w-0 flex-1">
                <a [routerLink]="['/personas', otro(c)]" class="font-bold text-ink no-underline block truncate">{{ personas.nombre(otro(c)) }}</a>
                <p class="m-0 text-xs text-muted truncate">{{ personas.de(otro(c))?.profile?.career }}@if (personas.de(otro(c))?.profile?.cycle) { · ciclo {{ personas.de(otro(c))?.profile?.cycle }} } · {{ c.createdAt | date: 'd MMM' }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                @switch (pestana()) {
                  @case ('recibidas') {
                    <button type="button" class="btn btn-ghost !min-h-10 !px-3" [disabled]="ocupado()" aria-label="Rechazar" (click)="rechazar(c)"><span class="icon">close</span></button>
                    <button type="button" class="btn btn-primary !min-h-10 !px-4" [disabled]="ocupado()" (click)="aceptar(c)"><span class="icon icon-fill">favorite</span><span class="hidden sm:inline">Aceptar</span></button>
                  }
                  @case ('enviadas') { <button type="button" class="btn btn-ghost !min-h-10" [disabled]="ocupado()" (click)="cancelar(c)">Cancelar</button> }
                  @default { <a [routerLink]="['/mensajes']" [queryParams]="{ con: otro(c) }" class="btn btn-primary !min-h-10"><span class="icon">chat</span><span class="hidden sm:inline">Mensaje</span></a> }
                }
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class Conexiones implements OnInit {
  protected readonly personas = inject(PersonasService);
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);
  private readonly tiempoReal = inject(TiempoReal);

  protected readonly pestanas: { id: Pestana; texto: string }[] = [
    { id: 'recibidas', texto: 'Recibidas' },
    { id: 'enviadas', texto: 'Enviadas' },
    { id: 'conectados', texto: 'Conectados' },
  ];
  protected readonly pestana = signal<Pestana>('recibidas');
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  private readonly recibidas = signal<ConexionApi[]>([]);
  private readonly enviadas = signal<ConexionApi[]>([]);
  private readonly conectados = signal<ConexionApi[]>([]);

  protected readonly actuales = computed(() => {
    switch (this.pestana()) {
      case 'recibidas': return this.recibidas();
      case 'enviadas': return this.enviadas();
      default: return this.conectados();
    }
  });
  protected readonly vacio = computed(() => {
    switch (this.pestana()) {
      case 'recibidas': return { titulo: 'Sin solicitudes por ahora', texto: 'Cuando alguien quiera conectar contigo aparecerá aquí.' };
      case 'enviadas': return { titulo: 'No tienes solicitudes enviadas', texto: 'Descubre a alguien y toca «Me interesa».' };
      default: return { titulo: 'Aún no tienes conexiones', texto: 'Conecta con alguien para chatear y proponer planes.' };
    }
  });

  ngOnInit(): void {
    this.cargar();
    this.tiempoReal.matches.subscribe(() => this.cargar());
  }

  protected cuenta(p: Pestana): number {
    return p === 'recibidas' ? this.recibidas().length : p === 'enviadas' ? this.enviadas().length : this.conectados().length;
  }

  protected otro(c: ConexionApi): number {
    return c.requesterId === this.auth.yo()?.id ? c.recipientId : c.requesterId;
  }

  private cargar(): void {
    forkJoin({ r: this.api.recibidas(), e: this.api.enviadas(), c: this.api.conexiones() }).subscribe({
      next: ({ r, e, c }) => {
        this.recibidas.set(r);
        this.enviadas.set(e);
        this.conectados.set(c.filter((x) => x.status === 'ACCEPTED'));
        if (r.length === 0 && this.conectados().length > 0 && this.pestana() === 'recibidas') this.pestana.set('conectados');
        const ids = [...r, ...e, ...this.conectados()].map((x) => this.otro(x));
        this.personas.cargar(ids).subscribe(() => this.cargando.set(false));
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.avisos.error(mensajeDeError(err));
      },
    });
  }

  private accion(llamada: () => ReturnType<Api['aceptar']>, ok: string, despues?: () => void): void {
    this.ocupado.set(true);
    llamada().subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok(ok);
        despues?.();
        this.cargar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected aceptar(c: ConexionApi): void {
    const id = this.otro(c);
    this.accion(() => this.api.aceptar(c.id), 'Conexión aceptada.', () => {
      if (this.tiempoReal.conectado()) return;
      const persona = this.personas.de(id);
      this.avisos.celebrar({ personaId: id, nombre: persona?.firstName ?? 'tu conexión', foto: persona?.photoUrl ?? null, genero: persona?.profile?.gender ?? null });
    });
  }

  protected rechazar(c: ConexionApi): void { this.accion(() => this.api.rechazar(c.id), 'Solicitud rechazada.'); }
  protected cancelar(c: ConexionApi): void { this.accion(() => this.api.cancelar(c.id), 'Solicitud cancelada.'); }
}
