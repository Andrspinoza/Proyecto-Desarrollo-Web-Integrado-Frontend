import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { mensajeDeError } from '../../core/errores';
import { correoEsDeLaUniversidad, metaUniversidad } from '../../core/universidades';
import { UniBadge } from '../../ui/uni-badge';

type Modo = 'login' | 'registro';

@Component({
  selector: 'app-acceso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UniBadge],
  template: `
    <div class="min-h-dvh grid lg:grid-cols-2">
      <aside class="hidden lg:flex flex-col justify-between p-12 bg-[radial-gradient(ellipse_at_bottom_left,#fff0e6,#fcfafc_70%)] border-r border-line">
        <a routerLink="/" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-2xl"><img src="logo-quesale-naranja.png" alt="" class="h-10 w-10" /> ¿Qué sale?</a>
        <div>
          <h1 class="font-display font-extrabold text-5xl leading-[1.05] m-0">Encuentra a tu gente <span class="text-brand">en tu universidad.</span></h1>
          <ul class="list-none p-0 mt-8 space-y-4 text-muted">
            <li class="flex gap-3"><span class="icon icon-fill text-brand">verified_user</span> Solo con correos institucionales verificados.</li>
            <li class="flex gap-3"><span class="icon icon-fill text-brand">favorite</span> Sugerencias por afinidad, con el motivo explicado.</li>
            <li class="flex gap-3"><span class="icon icon-fill text-brand">event_available</span> Planes para dos y juntadas grupales.</li>
          </ul>
        </div>
        <p class="text-xs text-muted m-0">Proyecto académico, no afiliado a ninguna universidad.</p>
      </aside>

      <main class="flex flex-col justify-center px-4 py-8 sm:px-10">
        <a routerLink="/" class="lg:hidden flex items-center gap-2 no-underline text-brand font-display font-bold text-xl mb-6"><img src="logo-quesale-naranja.png" alt="" class="h-9 w-9" /> ¿Qué sale?</a>
        <div class="w-full max-w-md mx-auto">
          @if (enviado()) {
            <div class="card p-7 text-center pop">
              <span class="icon icon-fill text-brand !text-[44px]">mark_email_read</span>
              <h2 class="font-display text-2xl font-bold mt-3 mb-2">Revisa tu correo</h2>
              <p class="text-muted m-0">Te enviamos un enlace de verificación a <strong class="text-ink break-all">{{ correo() }}</strong>. Ábrelo para activar tu cuenta.</p>
              @if (aviso()) { <p class="text-sm text-ok font-semibold mt-4 mb-0">{{ aviso() }}</p> }
              @if (error()) { <p class="error-text mt-4 mb-0">{{ error() }}</p> }
              <div class="flex flex-col gap-2 mt-6">
                <button type="button" class="btn btn-ghost" [disabled]="cargando()" (click)="reenviar()">Reenviar correo de verificación</button>
                <button type="button" class="btn btn-primary" (click)="irALogin()">Ya verifiqué, iniciar sesión</button>
              </div>
            </div>
          } @else {
            <div class="card p-5 sm:p-7">
              <div class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#f5f3f8] mb-6" role="tablist">
                <button type="button" role="tab" [attr.aria-selected]="modo() === 'login'" class="btn !min-h-10 border-0" [class.btn-primary]="modo() === 'login'" [class.btn-ghost]="modo() !== 'login'" [class.!bg-transparent]="modo() !== 'login'" (click)="cambiar('login')">Iniciar sesión</button>
                <button type="button" role="tab" [attr.aria-selected]="modo() === 'registro'" class="btn !min-h-10 border-0" [class.btn-primary]="modo() === 'registro'" [class.btn-ghost]="modo() !== 'registro'" [class.!bg-transparent]="modo() !== 'registro'" (click)="cambiar('registro')">Crear cuenta</button>
              </div>

              <form (submit)="enviar($event)" class="space-y-4" novalidate>
                @if (modo() === 'registro') {
                  <fieldset class="border-0 p-0 m-0">
                    <legend class="label">Tu universidad</legend>
                    <div class="grid grid-cols-2 gap-2">
                      @for (u of auth.universidades(); track u.id) {
                        <label class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft border-line">
                          <input type="radio" name="uni" class="sr-only" [checked]="universidadId() === u.id" (change)="universidadId.set(u.id)" />
                          <app-uni-badge [dominio]="u.emailDomain" [tam]="34" />
                          <span class="text-xs font-bold leading-tight">{{ sigla(u.emailDomain) }}</span>
                        </label>
                      }
                    </div>
                  </fieldset>
                  <div class="grid grid-cols-2 gap-3">
                    <div><label class="label" for="nombres">Nombres</label><input id="nombres" class="field" autocomplete="given-name" [value]="nombres()" (input)="nombres.set($any($event.target).value)" /></div>
                    <div><label class="label" for="apellidos">Apellidos</label><input id="apellidos" class="field" autocomplete="family-name" [value]="apellidos()" (input)="apellidos.set($any($event.target).value)" /></div>
                  </div>
                }

                <div>
                  <label class="label" for="correo">Correo institucional</label>
                  <input id="correo" type="email" class="field" autocomplete="username" inputmode="email" [placeholder]="modo() === 'registro' && dominio() ? 'tu.codigo@' + dominio() : 'tu correo institucional'" [value]="correo()" (input)="correo.set($any($event.target).value)" />
                  @if (modo() === 'registro' && dominio()) { <p class="text-xs text-muted mt-1 mb-0">Debe terminar en <strong>&#64;{{ dominio() }}</strong></p> }
                </div>

                <div>
                  <div class="flex items-center justify-between"><label class="label" for="clave">Contraseña</label>
                    @if (modo() === 'login') { <a routerLink="/olvide" class="text-xs font-bold text-brand mb-1.5">¿Olvidaste tu contraseña?</a> }
                  </div>
                  <div class="relative">
                    <input id="clave" [type]="ver() ? 'text' : 'password'" class="field !pr-12" [autocomplete]="modo() === 'login' ? 'current-password' : 'new-password'" [value]="clave()" (input)="clave.set($any($event.target).value)" />
                    <button type="button" class="absolute right-1 top-1/2 -translate-y-1/2 btn btn-ghost !min-h-9 !px-2 border-0" [attr.aria-label]="ver() ? 'Ocultar contraseña' : 'Mostrar contraseña'" (click)="ver.set(!ver())"><span class="icon !text-[20px]">{{ ver() ? 'visibility_off' : 'visibility' }}</span></button>
                  </div>
                  @if (modo() === 'registro') { <p class="text-xs text-muted mt-1 mb-0">Mínimo 8 caracteres.</p> }
                </div>

                @if (error()) { <p class="error-text m-0 flex items-start gap-1.5"><span class="icon !text-[18px]">error</span>{{ error() }}</p> }
                @if (necesitaVerificar()) {
                  <div class="rounded-xl bg-warn-soft p-3 text-sm">
                    <p class="m-0 mb-2 font-semibold">Aún no verificaste tu correo.</p>
                    <button type="button" class="btn btn-ghost !min-h-9" [disabled]="cargando()" (click)="reenviar()">Reenviar enlace de verificación</button>
                    @if (aviso()) { <p class="text-ok font-semibold mt-2 mb-0">{{ aviso() }}</p> }
                  </div>
                }

                <button type="submit" class="btn btn-primary w-full !min-h-12" [disabled]="cargando()">
                  {{ cargando() ? 'Un momento…' : modo() === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta' }}
                </button>
              </form>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class Acceso implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly modo = signal<Modo>('login');
  protected readonly correo = signal('');
  protected readonly clave = signal('');
  protected readonly nombres = signal('');
  protected readonly apellidos = signal('');
  protected readonly universidadId = signal<number | null>(null);
  protected readonly ver = signal(false);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly enviado = signal(false);
  protected readonly necesitaVerificar = signal(false);

  protected readonly dominio = computed(() => this.auth.universidades().find((u) => u.id === this.universidadId())?.emailDomain ?? null);

  ngOnInit(): void {
    this.auth.cargarUniversidades().subscribe({ error: () => this.error.set('No pudimos cargar las universidades.') });
    if (this.ruta.snapshot.queryParamMap.get('modo') === 'registro') this.modo.set('registro');
  }

  ngOnDestroy(): void {
    this.error.set('');
  }

  protected sigla(dominio: string): string {
    return metaUniversidad(dominio).sigla;
  }

  protected cambiar(modo: Modo): void {
    this.modo.set(modo);
    this.error.set('');
    this.aviso.set('');
    this.necesitaVerificar.set(false);
  }

  protected irALogin(): void {
    this.enviado.set(false);
    this.cambiar('login');
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    this.error.set('');
    this.aviso.set('');
    this.necesitaVerificar.set(false);
    if (this.modo() === 'login') this.entrar();
    else this.registrar();
  }

  protected reenviar(): void {
    this.cargando.set(true);
    this.api.reenviarVerificacion(this.correo().trim(), this.clave()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.aviso.set('Si el correo y la contraseña son correctos, te enviamos un nuevo enlace.');
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  private entrar(): void {
    if (!this.correo().trim() || !this.clave()) {
      this.error.set('Escribe tu correo y tu contraseña.');
      return;
    }
    this.cargando.set(true);
    this.auth.iniciarSesion(this.correo().trim(), this.clave()).subscribe({
      next: () => {
        this.cargando.set(false);
        void this.router.navigate(['/descubrir']);
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        if (e instanceof HttpErrorResponse && e.status === 403) {
          this.necesitaVerificar.set(true);
          this.error.set('Verifica tu correo institucional para entrar.');
        } else if (e instanceof HttpErrorResponse && e.status === 401) {
          this.error.set('Correo o contraseña incorrectos.');
        } else {
          this.error.set(mensajeDeError(e));
        }
      },
    });
  }

  private registrar(): void {
    const universidadId = this.universidadId();
    if (universidadId === null) return this.error.set('Elige tu universidad.');
    if (!this.nombres().trim() || !this.apellidos().trim()) return this.error.set('Escribe tus nombres y apellidos.');
    if (!correoEsDeLaUniversidad(this.correo(), this.dominio())) return this.error.set(`Usa tu correo institucional, que termina en @${this.dominio()}.`);
    if (this.clave().length < 8) return this.error.set('La contraseña debe tener al menos 8 caracteres.');
    this.cargando.set(true);
    this.api.registrar({ universityId: universidadId, email: this.correo().trim(), password: this.clave(), firstName: this.nombres().trim(), lastName: this.apellidos().trim() }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.error.set(e instanceof HttpErrorResponse && e.status === 409 ? 'Ese correo ya tiene una cuenta. Prueba iniciando sesión.' : mensajeDeError(e));
      },
    });
  }
}
