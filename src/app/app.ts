import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Avisos } from './core/avisos.service';
import { AuthService } from './core/auth.service';
import { Avatar } from './ui/avatar';
import { Modal } from './ui/modal';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Avatar, Modal],
  template: `
    <router-outlet />

    <div class="fixed z-[90] left-1/2 -translate-x-1/2 bottom-24 lg:bottom-6 flex flex-col gap-2 w-[min(92vw,420px)] pointer-events-none" aria-live="polite">
      @for (t of avisos.toasts(); track t.id) {
        <div class="rise pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg text-sm font-semibold text-white"
          [class.bg-ok]="t.tipo === 'ok'" [class.bg-danger]="t.tipo === 'error'" [class.bg-ink]="t.tipo === 'info'">
          <span class="icon icon-fill shrink-0">{{ t.tipo === 'ok' ? 'check_circle' : t.tipo === 'error' ? 'error' : 'info' }}</span>
          <span class="flex-1">{{ t.texto }}</span>
          <button type="button" class="bg-transparent border-0 text-white/80 cursor-pointer p-0" aria-label="Cerrar aviso" (click)="avisos.quitar(t.id)"><span class="icon !text-[18px]">close</span></button>
        </div>
      }
    </div>

    @if (avisos.celebracion(); as c) {
      <app-modal titulo="¡Hay química!" (cerrar)="avisos.cerrarCelebracion()">
        <div class="text-center">
          <div class="flex items-center justify-center -space-x-4 mb-4">
            <span class="rounded-full ring-4 ring-white shadow-md"><app-avatar [foto]="auth.yo()?.photoUrl ?? null" [genero]="auth.yo()?.profile?.gender ?? null" [nombre]="auth.nombre()" [tam]="92" /></span>
            <span class="rounded-full ring-4 ring-white shadow-md"><app-avatar [foto]="c.foto" [genero]="c.genero" [nombre]="c.nombre" [tam]="92" /></span>
          </div>
          <p class="font-display text-2xl font-bold text-brand m-0">¡Hay química! ¿Qué sale?</p>
          <p class="text-muted mt-2 mb-5">Tú y {{ c.nombre }} aceptaron conectar. Ahora pueden conversar y proponer un plan.</p>
          <div class="flex flex-col sm:flex-row gap-2 justify-center">
            <button type="button" class="btn btn-primary" (click)="irAMensajes(c.personaId)"><span class="icon">chat</span> Enviar mensaje</button>
            <button type="button" class="btn btn-ghost" (click)="avisos.cerrarCelebracion()">Seguir descubriendo</button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class App {
  protected readonly avisos = inject(Avisos);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected irAMensajes(personaId: number): void {
    this.avisos.cerrarCelebracion();
    void this.router.navigate(['/mensajes'], { queryParams: { con: personaId } });
  }
}
