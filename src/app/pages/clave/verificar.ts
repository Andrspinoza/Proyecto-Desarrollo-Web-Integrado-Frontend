import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../core/api.service';

@Component({
  selector: 'app-verificar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="min-h-dvh flex flex-col items-center justify-center px-4 py-10 bg-[radial-gradient(ellipse_at_top,#fff0e6,#fcfafc_60%)]">
      <a routerLink="/" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-xl mb-6"><img src="logo-quesale-naranja.png" alt="" class="h-9 w-9" /> ¿Qué sale?</a>
      <div class="card w-full max-w-md p-6 sm:p-8 text-center">
        @switch (estado()) {
          @case ('cargando') {
            <span class="icon text-brand !text-[44px] animate-spin">progress_activity</span>
            <h1 class="font-display text-2xl font-bold mt-3 mb-0">Verificando tu correo…</h1>
          }
          @case ('ok') {
            <div class="pop">
              <span class="icon icon-fill text-ok !text-[44px]">verified</span>
              <h1 class="font-display text-2xl font-bold mt-3 mb-2">¡Correo verificado!</h1>
              <p class="text-muted m-0">Tu cuenta está activa. Inicia sesión para completar tu perfil.</p>
              <a routerLink="/acceso" class="btn btn-primary mt-6 w-full">Iniciar sesión</a>
            </div>
          }
          @default {
            <span class="icon icon-fill text-danger !text-[44px]">link_off</span>
            <h1 class="font-display text-2xl font-bold mt-3 mb-2">Enlace no válido</h1>
            <p class="text-muted m-0">El enlace venció o ya se usó. Inicia sesión y pide que te enviemos uno nuevo.</p>
            <a routerLink="/acceso" class="btn btn-primary mt-6 w-full">Ir a iniciar sesión</a>
          }
        }
      </div>
    </main>
  `,
})
export class Verificar implements OnInit {
  private readonly api = inject(Api);
  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
  protected readonly estado = signal<'cargando' | 'ok' | 'error'>('cargando');

  ngOnInit(): void {
    if (!this.token) {
      this.estado.set('error');
      return;
    }
    this.api.confirmarCorreo(this.token).subscribe({
      next: () => this.estado.set('ok'),
      error: () => this.estado.set('error'),
    });
  }
}
