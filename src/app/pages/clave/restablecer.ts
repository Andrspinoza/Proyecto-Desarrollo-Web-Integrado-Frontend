import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Api } from '../../core/api.service';
import { mensajeDeError } from '../../core/errores';

@Component({
  selector: 'app-restablecer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="min-h-dvh flex flex-col items-center justify-center px-4 py-10 bg-[radial-gradient(ellipse_at_top,#fff0e6,#fcfafc_60%)]">
      <a routerLink="/" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-xl mb-6"><img src="logo-quesale-naranja.png" alt="" class="h-9 w-9" /> ¿Qué sale?</a>
      <div class="card w-full max-w-md p-6 sm:p-8">
        @if (listo()) {
          <div class="text-center pop">
            <span class="icon icon-fill text-ok !text-[44px]">check_circle</span>
            <h1 class="font-display text-2xl font-bold mt-3 mb-2">Contraseña actualizada</h1>
            <p class="text-muted m-0">Ya puedes iniciar sesión con tu contraseña nueva.</p>
            <a routerLink="/acceso" class="btn btn-primary mt-6 w-full">Iniciar sesión</a>
          </div>
        } @else if (!token()) {
          <div class="text-center">
            <span class="icon icon-fill text-danger !text-[44px]">link_off</span>
            <h1 class="font-display text-2xl font-bold mt-3 mb-2">Enlace incompleto</h1>
            <p class="text-muted m-0">Abre el enlace completo que te enviamos por correo, o pide uno nuevo.</p>
            <a routerLink="/olvide" class="btn btn-primary mt-6 w-full">Pedir otro enlace</a>
          </div>
        } @else {
          <h1 class="font-display text-2xl font-bold m-0">Elige una contraseña nueva</h1>
          <form (submit)="enviar($event)" class="space-y-4 mt-6" novalidate>
            <div>
              <label class="label" for="clave">Contraseña nueva</label>
              <input id="clave" type="password" class="field" autocomplete="new-password" [value]="clave()" (input)="clave.set($any($event.target).value)" />
              <p class="text-xs text-muted mt-1 mb-0">Mínimo 8 caracteres.</p>
            </div>
            <div>
              <label class="label" for="repetir">Repite la contraseña</label>
              <input id="repetir" type="password" class="field" autocomplete="new-password" [value]="repetir()" (input)="repetir.set($any($event.target).value)" />
            </div>
            @if (error()) { <p class="error-text m-0">{{ error() }}</p> }
            @if (vencido()) { <a routerLink="/olvide" class="btn btn-ghost w-full">Pedir otro enlace</a> }
            <button type="submit" class="btn btn-primary w-full !min-h-12" [disabled]="cargando()">{{ cargando() ? 'Guardando…' : 'Guardar contraseña' }}</button>
          </form>
        }
      </div>
    </main>
  `,
})
export class Restablecer {
  private readonly api = inject(Api);
  protected readonly token = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '');
  protected readonly clave = signal('');
  protected readonly repetir = signal('');
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly listo = signal(false);
  protected readonly vencido = signal(false);

  protected enviar(evento: Event): void {
    evento.preventDefault();
    if (this.clave().length < 8) return this.error.set('La contraseña debe tener al menos 8 caracteres.');
    if (this.clave() !== this.repetir()) return this.error.set('Las contraseñas no coinciden.');
    this.error.set('');
    this.cargando.set(true);
    this.api.restablecerClave(this.token(), this.clave()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.listo.set(true);
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        if (e instanceof HttpErrorResponse && e.status === 400 && String((e.error as { message?: string } | null)?.message ?? '').includes('enlace')) {
          this.vencido.set(true);
          this.error.set('El enlace no es válido o ya venció.');
        } else {
          this.error.set(mensajeDeError(e));
        }
      },
    });
  }
}
