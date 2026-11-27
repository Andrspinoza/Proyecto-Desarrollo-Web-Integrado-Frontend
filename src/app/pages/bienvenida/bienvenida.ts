import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { Api } from '../../core/api.service';
import { Avisos } from '../../core/avisos.service';
import { AuthService } from '../../core/auth.service';
import { ItemCatalogo } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PerfilEstado } from '../../core/perfil-estado';
import { metaUniversidad } from '../../core/universidades';
import { FotoSelector } from '../../ui/foto-selector';
import { CamposAcademicos, CamposGustos, CamposPersonales, CamposSobreTi } from '../../ui/perfil-campos';

@Component({
  selector: 'app-bienvenida',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FotoSelector, CamposPersonales, CamposAcademicos, CamposGustos, CamposSobreTi],
  template: `
    <main class="min-h-dvh bg-[radial-gradient(ellipse_at_top,var(--color-brand-soft),var(--color-canvas)_55%)] px-4 py-6 sm:py-10">
      <div class="max-w-xl mx-auto">
        <div class="flex items-center justify-between mb-5">
          <span class="flex items-center gap-2 text-brand font-display font-bold text-xl"><img src="logo-quesale-naranja.png" alt="" class="h-9 w-9" /> ¿Qué sale?</span>
          <button type="button" class="text-sm font-bold text-muted bg-transparent border-0 cursor-pointer" (click)="salir()">Salir</button>
        </div>

        <div class="mb-5" role="progressbar" aria-label="Progreso" [attr.aria-valuenow]="paso() + 1" aria-valuemin="1" aria-valuemax="4">
          <div class="flex gap-1.5">@for (n of pasos; track n) { <span class="h-1.5 flex-1 rounded-full" [class.bg-brand]="n <= paso()" [class.bg-line]="n > paso()"></span> }</div>
          <p class="text-xs font-bold text-muted mt-2 mb-0">Paso {{ paso() + 1 }} de 4</p>
        </div>

        <div class="card p-5 sm:p-7 rise">
          <h1 class="font-display text-2xl sm:text-3xl font-bold m-0">{{ titulos[paso()] }}</h1>
          <p class="text-muted mt-1 mb-6">{{ subtitulos[paso()] }}</p>

          @switch (paso()) {
            @case (0) {
              <app-foto-selector [fotoActual]="fotoVista()" [genero]="estado.genero()" [nombre]="auth.nombre()" (elegida)="foto.set($event)" (quitada)="foto.set(null)" />
              <div class="mt-6"><app-campos-personales [estado]="estado" /></div>
            }
            @case (1) { <app-campos-academicos [estado]="estado" [sedes]="sedes()" /> }
            @case (2) { <app-campos-gustos [estado]="estado" [intereses]="intereses()" [habilidades]="habilidades()" /> }
            @default { <app-campos-sobre-ti [estado]="estado" /> }
          }

          @if (error()) { <p class="error-text mt-4 mb-0">{{ error() }}</p> }

          <div class="flex gap-3 mt-7">
            @if (paso() > 0) { <button type="button" class="btn btn-ghost" (click)="paso.set(paso() - 1)">Atrás</button> }
            @if (paso() < 3) {
              <button type="button" class="btn btn-primary flex-1" [disabled]="!puedeAvanzar()" (click)="siguiente()">Continuar</button>
            } @else {
              <button type="button" class="btn btn-primary flex-1" [disabled]="guardando() || !estado.completo()" (click)="terminar()">{{ guardando() ? 'Guardando…' : 'Terminar y descubrir gente' }}</button>
            }
          </div>
        </div>
      </div>
    </main>
  `,
})
export class Bienvenida implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly avisos = inject(Avisos);

  protected readonly estado = new PerfilEstado();
  protected readonly pasos = [0, 1, 2, 3];
  protected readonly titulos = ['Empecemos por ti', 'Tu vida universitaria', '¿Qué te gusta?', 'Casi listo'];
  protected readonly subtitulos = [
    'Una foto y unos datos básicos hacen que los demás te reconozcan.',
    'Así te sugerimos gente de tu carrera, ciclo y sede.',
    'Elige lo que quieras: es lo que más pesa en la afinidad.',
    'Cuéntanos algo de ti y decide quién ve tu perfil.',
  ];
  protected readonly paso = signal(0);
  protected readonly foto = signal<Blob | null>(null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly intereses = signal<ItemCatalogo[]>([]);
  protected readonly habilidades = signal<ItemCatalogo[]>([]);
  protected readonly fotoVista = computed(() => this.auth.yo()?.photoUrl ?? null);
  protected readonly sedes = computed(() => metaUniversidad(this.auth.universidad()?.emailDomain).sedes);
  protected readonly puedeAvanzar = computed(() => {
    switch (this.paso()) {
      case 0: return this.estado.datosPersonalesValidos();
      case 1: return this.estado.academicoValido();
      default: return true;
    }
  });

  ngOnInit(): void {
    this.auth.cargarUniversidades().subscribe();
    if (this.auth.yo() === null) this.auth.cargarYo().subscribe();
    forkJoin({ i: this.api.intereses(), h: this.api.habilidades() }).subscribe({
      next: ({ i, h }) => {
        this.intereses.set(i);
        this.habilidades.set(h);
      },
      error: () => this.error.set('No pudimos cargar los intereses. Recarga la página.'),
    });
  }

  protected siguiente(): void {
    if (this.puedeAvanzar()) this.paso.update((n) => n + 1);
  }

  protected terminar(): void {
    if (!this.estado.completo()) return;
    this.error.set('');
    this.guardando.set(true);
    const foto = this.foto();
    this.api
      .guardarPerfil(this.estado.datos())
      .pipe(switchMap(() => (foto !== null ? this.api.subirFoto(foto) : of(null))), switchMap(() => this.auth.cargarYo()))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.avisos.ok('¡Listo! Ya puedes descubrir gente.');
          void this.router.navigate(['/descubrir']);
        },
        error: (e: unknown) => {
          this.guardando.set(false);
          this.error.set(mensajeDeError(e, 'No pudimos guardar tu perfil. Inténtalo otra vez.'));
        },
      });
  }

  protected salir(): void {
    this.auth.cerrarSesion();
  }
}
