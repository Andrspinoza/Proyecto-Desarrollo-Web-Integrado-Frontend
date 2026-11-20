import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { MeetupApi, Recomendacion, ResumenEstudiante } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PersonasService } from '../../core/personas.service';
import { Avatar } from '../../ui/avatar';
import { PersonaCard } from '../../ui/persona-card';
import { UniBadge } from '../../ui/uni-badge';

@Component({
  selector: 'app-descubrir',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, PersonaCard, Avatar, UniBadge],
  template: `
    <div class="grid lg:grid-cols-[280px_1fr_300px] gap-5 items-start">
      <aside class="hidden lg:block card p-5 sticky top-24">
        <div class="flex flex-col items-center text-center">
          <app-avatar [foto]="auth.yo()?.photoUrl ?? null" [genero]="auth.yo()?.profile?.gender ?? null" [nombre]="auth.nombre()" [tam]="84" />
          <p class="font-display font-bold text-lg mt-3 mb-0">{{ auth.yo()?.firstName }} {{ auth.yo()?.lastName }}</p>
          <p class="text-sm text-muted m-0">{{ auth.yo()?.profile?.career }} · ciclo {{ auth.yo()?.profile?.cycle }}</p>
        </div>
        <div class="flex items-center gap-2 mt-4 p-3 rounded-xl bg-[#f5f3f8]">
          <app-uni-badge [dominio]="auth.universidad()?.emailDomain ?? null" [tam]="34" />
          <span class="text-xs font-bold leading-tight">{{ auth.universidad()?.name }}</span>
        </div>
        <a routerLink="/perfil" class="btn btn-ghost w-full mt-4">Editar mi perfil</a>
      </aside>

      <section class="min-w-0">
        <h1 class="font-display font-extrabold text-3xl sm:text-4xl m-0">Tu gente está por aquí</h1>
        <p class="text-muted mt-1 mb-5">Conoce a alguien de tu universidad con quien sí salga un plan.</p>

        @if (busqueda()) {
          <div class="flex items-center justify-between mb-3">
            <p class="m-0 font-bold">Resultados para «{{ busqueda() }}»</p>
            <a routerLink="/descubrir" class="text-sm font-bold text-brand">Ver sugerencias</a>
          </div>
          @if (cargando()) { <p class="text-muted">Buscando…</p> }
          @else if (resultados().length === 0) { <div class="card p-6 text-center text-muted">No encontramos estudiantes con ese nombre en tu universidad.</div> }
          @else {
            <ul class="list-none p-0 m-0 space-y-2">
              @for (p of resultados(); track p.id) {
                <li class="card p-3 flex items-center gap-3">
                  <app-avatar [foto]="personas.de(p.id)?.photoUrl ?? null" [genero]="personas.de(p.id)?.profile?.gender ?? null" [nombre]="p.firstName" [tam]="48" />
                  <div class="min-w-0 flex-1"><p class="m-0 font-bold truncate">{{ p.firstName }} {{ p.lastName }}</p><p class="m-0 text-xs text-muted truncate">{{ personas.de(p.id)?.profile?.career }}</p></div>
                  <a [routerLink]="['/personas', p.id]" class="btn btn-ghost !min-h-10">Ver perfil</a>
                </li>
              }
            </ul>
          }
        } @else {
          @if (cargando()) {
            <div class="card p-10 text-center text-muted"><span class="icon animate-spin !text-[36px] text-brand">progress_activity</span><p class="mt-2 mb-0">Buscando a tu gente…</p></div>
          } @else if (error()) {
            <div class="card p-6 text-center"><p class="error-text">{{ error() }}</p><button type="button" class="btn btn-ghost" (click)="cargar()">Reintentar</button></div>
          } @else if (actual(); as r) {
            <app-persona-card [r]="r" [ocupado]="ocupado()" (pasar)="pasar()" (ver)="ver(r.id)" (interesa)="interesa(r)" />
            @if (siguientes().length > 0) {
              <h2 class="font-display text-lg font-bold mt-7 mb-3">Más personas para ti</h2>
              <ul class="list-none p-0 m-0 grid sm:grid-cols-2 gap-3">
                @for (s of siguientes(); track s.id) {
                  <li>
                    <button type="button" class="card w-full p-3 flex items-center gap-3 text-left cursor-pointer hover:border-brand" (click)="elegir(s.id)">
                      <app-avatar [foto]="s.photoUrl" [genero]="s.gender" [nombre]="s.firstName" [tam]="52" />
                      <span class="min-w-0 flex-1"><span class="block font-bold truncate">{{ s.firstName }} {{ s.lastName.charAt(0) }}.</span><span class="block text-xs text-muted truncate">{{ s.career }} · ciclo {{ s.cycle }}</span></span>
                      <span class="font-display font-extrabold text-brand">{{ s.affinityPercent }}%</span>
                    </button>
                  </li>
                }
              </ul>
            }
          } @else {
            <div class="card p-8 text-center">
              <span class="icon icon-fill text-brand !text-[44px]">groups</span>
              <h2 class="font-display text-2xl font-bold mt-2 mb-2">{{ lista().length === 0 && vistos() === 0 ? 'Aún no hay sugerencias' : 'Ya viste a todos por ahora' }}</h2>
              <p class="text-muted max-w-md mx-auto m-0">{{ lista().length === 0 && vistos() === 0 ? 'Cuando más estudiantes de tu universidad completen su perfil, aparecerán aquí. Invita a tus amigos.' : 'Vuelve más tarde: cada día se suman estudiantes nuevos.' }}</p>
              @if (vistos() > 0) { <button type="button" class="btn btn-primary mt-5" (click)="cargar()">Volver a mirar</button> }
            </div>
          }
        }
      </section>

      <aside class="space-y-4 lg:sticky lg:top-24">
        <div class="card p-5">
          <h2 class="font-display text-lg font-bold m-0 flex items-center gap-2"><span class="icon icon-fill text-brand">event</span> Planes para dos</h2>
          <p class="text-sm text-muted mt-1 mb-3">Propón algo a una conexión: un café, un partido, estudiar juntos.</p>
          @if (planes().length === 0) { <p class="text-sm text-muted m-0">Todavía no hay planes publicados en tu universidad.</p> }
          <ul class="list-none p-0 m-0 space-y-2">
            @for (m of planes(); track m.id) {
              <li class="p-3 rounded-xl bg-[#f5f3f8]">
                <p class="m-0 font-bold text-sm leading-snug">{{ m.title }}</p>
                <p class="m-0 text-xs text-muted mt-0.5">{{ m.scheduledAt | date: "EEE d MMM, h:mm a" }} · {{ m.place.district }}</p>
              </li>
            }
          </ul>
          <a routerLink="/planes" class="btn btn-ghost w-full mt-4">Ver todos los planes</a>
        </div>
      </aside>
    </div>
  `,
})
export class Descubrir implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly personas = inject(PersonasService);
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly destruir = inject(DestroyRef);

  protected readonly lista = signal<Recomendacion[]>([]);
  protected readonly indice = signal(0);
  protected readonly vistos = signal(0);
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly error = signal('');
  protected readonly planes = signal<MeetupApi[]>([]);
  protected readonly busqueda = signal('');
  protected readonly resultados = signal<ResumenEstudiante[]>([]);

  protected readonly actual = computed(() => this.lista()[this.indice()] ?? null);
  protected readonly siguientes = computed(() => this.lista().slice(this.indice() + 1, this.indice() + 5));

  ngOnInit(): void {
    this.ruta.queryParamMap.pipe(takeUntilDestroyed(this.destruir)).subscribe((q) => {
      this.busqueda.set(q.get('q') ?? '');
      if (this.busqueda()) this.buscar();
      else this.cargar();
    });
    this.api.meetups().subscribe({
      next: (lista) => this.planes.set(lista.filter((m) => m.status === 'SCHEDULED').slice(0, 3)),
      error: () => undefined,
    });
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.indice.set(0);
    this.vistos.set(0);
    this.api.recomendaciones(30).subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeDeError(e, 'No pudimos cargar las sugerencias.'));
      },
    });
  }

  private buscar(): void {
    this.cargando.set(true);
    this.api.buscar(this.busqueda()).subscribe({
      next: (lista) => {
        this.resultados.set(lista);
        this.personas.cargar(lista.map((p) => p.id)).subscribe(() => this.cargando.set(false));
      },
      error: () => this.cargando.set(false),
    });
  }

  protected pasar(): void {
    this.vistos.update((n) => n + 1);
    this.lista.update((lista) => lista.filter((_, i) => i !== this.indice()));
    if (this.indice() >= this.lista().length) this.indice.set(0);
  }

  protected elegir(id: number): void {
    const posicion = this.lista().findIndex((r) => r.id === id);
    if (posicion >= 0) this.indice.set(posicion);
  }

  protected ver(id: number): void {
    void this.router.navigate(['/personas', id]);
  }

  protected interesa(r: Recomendacion): void {
    this.ocupado.set(true);
    this.api.conectar(r.id).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok(`Solicitud enviada a ${r.firstName}. Si acepta, ¡hay química!`);
        this.pasar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(e instanceof HttpErrorResponse && e.status === 409 ? `Ya hay una solicitud con ${r.firstName}.` : mensajeDeError(e));
      },
    });
  }
}
