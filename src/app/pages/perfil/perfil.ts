import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { BloqueoApi, ItemCatalogo } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PerfilEstado } from '../../core/perfil-estado';
import { PersonasService } from '../../core/personas.service';
import { TiempoReal } from '../../core/tiempo-real.service';
import { metaUniversidad } from '../../core/universidades';
import { Avatar } from '../../ui/avatar';
import { FotoSelector } from '../../ui/foto-selector';
import { CamposAcademicos, CamposGustos, CamposPersonales, CamposSobreTi } from '../../ui/perfil-campos';
import { UniBadge } from '../../ui/uni-badge';

@Component({
  selector: 'app-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, FotoSelector, CamposPersonales, CamposAcademicos, CamposGustos, CamposSobreTi, UniBadge],
  template: `
    <div class="max-w-3xl mx-auto space-y-5">
      <section class="card overflow-hidden">
        <div class="bg-gradient-to-br from-brand-soft to-[#f5f3f8] p-5 sm:p-7">
          <div class="flex items-center gap-4">
            <app-avatar [foto]="fotoVista()" [genero]="estado.genero()" [nombre]="auth.nombre()" [tam]="84" />
            <div class="min-w-0">
              <h1 class="font-display font-extrabold text-2xl sm:text-3xl m-0 truncate">{{ auth.yo()?.firstName }} {{ auth.yo()?.lastName }}</h1>
              <p class="text-muted text-sm mt-1 mb-0 truncate">{{ auth.yo()?.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-4 text-sm font-bold">
            <app-uni-badge [dominio]="auth.universidad()?.emailDomain ?? null" [tam]="32" />
            <span class="truncate">{{ auth.universidad()?.name }}</span>
            <span class="chip chip-on !ml-auto shrink-0"><span class="icon icon-fill !text-[14px]">verified</span> Verificada</span>
          </div>
        </div>
      </section>

      <section class="card p-5 sm:p-7">
        <h2 class="font-display text-xl font-bold m-0 mb-4">Foto de perfil</h2>
        <app-foto-selector [fotoActual]="auth.yo()?.photoUrl ?? null" [genero]="estado.genero()" [nombre]="auth.nombre()" (elegida)="foto.set($event); quitar.set(false)" (quitada)="foto.set(null); quitar.set(true)" />
      </section>

      <section class="card p-5 sm:p-7"><h2 class="font-display text-xl font-bold m-0 mb-4">Sobre ti</h2><app-campos-personales [estado]="estado" /></section>
      <section class="card p-5 sm:p-7"><h2 class="font-display text-xl font-bold m-0 mb-4">Vida universitaria</h2><app-campos-academicos [estado]="estado" [sedes]="sedes()" /></section>
      <section class="card p-5 sm:p-7"><h2 class="font-display text-xl font-bold m-0 mb-4">Gustos y habilidades</h2><app-campos-gustos [estado]="estado" [intereses]="intereses()" [habilidades]="habilidades()" /></section>
      <section class="card p-5 sm:p-7"><h2 class="font-display text-xl font-bold m-0 mb-4">Descripción y privacidad</h2><app-campos-sobre-ti [estado]="estado" /></section>

      <div class="sticky bottom-20 lg:bottom-4 z-10">
        <button type="button" class="btn btn-primary w-full !min-h-12 shadow-lg" [disabled]="guardando() || !estado.completo()" (click)="guardar()">{{ guardando() ? 'Guardando…' : 'Guardar cambios' }}</button>
        @if (error()) { <p class="error-text mt-2 mb-0 text-center bg-white rounded-lg p-2">{{ error() }}</p> }
      </div>

      <section class="card p-5 sm:p-7">
        <h2 class="font-display text-xl font-bold m-0 mb-4">Seguridad</h2>
        <div class="flex flex-col sm:flex-row gap-2">
          <button type="button" class="btn btn-ghost flex-1" [disabled]="claveEnviada()" (click)="cambiarClave()"><span class="icon">key</span> {{ claveEnviada() ? 'Enlace enviado a tu correo' : 'Cambiar mi contraseña' }}</button>
          <button type="button" class="btn btn-danger flex-1" (click)="salir()"><span class="icon">logout</span> Cerrar sesión</button>
        </div>
        <h3 class="font-display text-base font-bold mt-6 mb-2">Personas bloqueadas</h3>
        @if (bloqueos().length === 0) { <p class="text-sm text-muted m-0">No has bloqueado a nadie.</p> }
        <ul class="list-none p-0 m-0 space-y-2">
          @for (b of bloqueos(); track b.id) {
            <li class="flex items-center gap-3 p-2 rounded-xl bg-[#f5f3f8]">
              <app-avatar [foto]="personas.de(b.blockedId)?.photoUrl ?? null" [genero]="personas.de(b.blockedId)?.profile?.gender ?? null" [nombre]="personas.nombre(b.blockedId)" [tam]="36" />
              <span class="flex-1 font-bold text-sm truncate">{{ personas.nombre(b.blockedId) }}</span>
              <button type="button" class="btn btn-ghost !min-h-9" (click)="desbloquear(b)">Desbloquear</button>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class Perfil implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly personas = inject(PersonasService);
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly tiempoReal = inject(TiempoReal);

  protected readonly estado = new PerfilEstado();
  protected readonly foto = signal<Blob | null>(null);
  protected readonly quitar = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly claveEnviada = signal(false);
  protected readonly intereses = signal<ItemCatalogo[]>([]);
  protected readonly habilidades = signal<ItemCatalogo[]>([]);
  protected readonly bloqueos = signal<BloqueoApi[]>([]);
  protected readonly fotoVista = computed(() => (this.quitar() ? null : this.auth.yo()?.photoUrl ?? null));
  protected readonly sedes = computed(() => metaUniversidad(this.auth.universidad()?.emailDomain).sedes);

  ngOnInit(): void {
    const yo = this.auth.yo();
    if (yo !== null) this.estado.cargar(yo);
    forkJoin({ i: this.api.intereses(), h: this.api.habilidades() }).subscribe({ next: ({ i, h }) => { this.intereses.set(i); this.habilidades.set(h); }, error: () => undefined });
    this.cargarBloqueos();
  }

  private cargarBloqueos(): void {
    this.api.bloqueos().subscribe({
      next: (lista) => {
        this.bloqueos.set(lista);
        this.personas.cargar(lista.map((b) => b.blockedId)).subscribe();
      },
      error: () => undefined,
    });
  }

  protected guardar(): void {
    if (!this.estado.completo()) return;
    this.error.set('');
    this.guardando.set(true);
    const foto = this.foto();
    const quitar = this.quitar();
    this.api
      .guardarPerfil(this.estado.datos())
      .pipe(
        switchMap(() => (foto !== null ? this.api.subirFoto(foto) : quitar ? this.api.quitarFoto() : of(null))),
        switchMap(() => this.auth.cargarYo()),
      )
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.foto.set(null);
          this.quitar.set(false);
          this.avisos.ok('Perfil actualizado.');
        },
        error: (e: unknown) => {
          this.guardando.set(false);
          this.error.set(mensajeDeError(e, 'No pudimos guardar los cambios.'));
        },
      });
  }

  protected cambiarClave(): void {
    const correo = this.auth.yo()?.email;
    if (!correo) return;
    this.api.olvideMiClave(correo).subscribe({
      next: () => {
        this.claveEnviada.set(true);
        this.avisos.ok('Te enviamos un enlace a tu correo institucional.');
      },
      error: (e: unknown) => this.avisos.error(mensajeDeError(e)),
    });
  }

  protected desbloquear(b: BloqueoApi): void {
    this.api.desbloquear(b.blockedId).subscribe({
      next: () => {
        this.avisos.ok('Persona desbloqueada.');
        this.cargarBloqueos();
      },
      error: (e: unknown) => this.avisos.error(mensajeDeError(e)),
    });
  }

  protected salir(): void {
    this.tiempoReal.desconectar();
    this.auth.cerrarSesion();
  }
}
