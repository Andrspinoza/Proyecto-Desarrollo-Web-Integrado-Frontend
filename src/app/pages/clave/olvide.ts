import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api.service';
import { mensajeDeError } from '../../core/errores';

@Component({
  selector: 'app-olvide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="min-h-dvh flex flex-col items-center justify-center px-4 py-10 bg-[radial-gradient(ellipse_at_top,var(--color-brand-soft),var(--color-canvas)_60%)]">
      <a routerLink="/" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-xl mb-6"><img src="logo-quesale-naranja.png" alt="" class="h-9 w-9" /> ¿Qué sale?</a>
      <div class="card w-full max-w-md p-6 sm:p-8">
        @if (enviado()) {
          <div class="text-center pop">
            <span class="icon icon-fill text-brand !text-[44px]">forward_to_inbox</span>
            <h1 class="font-display text-2xl font-bold mt-3 mb-2">Revisa tu correo</h1>
            <p class="text-muted m-0">Si ese correo tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva. Vence en 1 hora.</p>
            <a routerLink="/acceso" class="btn btn-primary mt-6 w-full">Volver a iniciar sesión</a>
          </div>
        } @else {
          <h1 class="font-display text-2xl font-bold m-0">¿Olvidaste tu contraseña?</h1>
          <p class="text-muted mt-2 mb-6">Escribe tu correo institucional y te enviamos un enlace para restablecerla.</p>
          <form (submit)="enviar($event)" class="space-y-4" novalidate>
            <div>
              <label class="label" for="correo">Correo institucional</label>
              <input id="correo" type="email" class="field" autocomplete="username" inputmode="email" [value]="correo()" (input)="correo.set($any($event.target).value)" />
            </div>
            @if (error()) { <p class="error-text m-0">{{ error() }}</p> }
            <button type="submit" class="btn btn-primary w-full !min-h-12" [disabled]="cargando()">{{ cargando() ? 'Enviando…' : 'Enviar enlace' }}</button>
            <a routerLink="/acceso" class="block text-center text-sm font-bold text-muted">Volver</a>
          </form>
        }
      </div>
    </main>
  `,
})
export class Olvide {
  private readonly api = inject(Api);
  protected readonly correo = signal('');
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly enviado = signal(false);

  protected enviar(evento: Event): void {
    evento.preventDefault();
    const correo = this.correo().trim();
    if (!correo.includes('@')) {
      this.error.set('Escribe un correo válido.');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.api.olvideMiClave(correo).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }
}
