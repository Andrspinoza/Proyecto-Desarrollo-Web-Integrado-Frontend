import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Genero } from '../core/api.models';

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (foto()) {
      <img [src]="foto()" [alt]="'Foto de ' + nombre()" class="rounded-full object-cover bg-[#f1f3fa]" [style.width.px]="tam()" [style.height.px]="tam()" loading="lazy" />
    } @else {
      <svg viewBox="0 0 64 64" role="img" [attr.aria-label]="'Sin foto de ' + nombre()" class="rounded-full shrink-0" [style.width.px]="tam()" [style.height.px]="tam()">
        <rect width="64" height="64" [attr.fill]="colores().fondo" />
        @if (genero() === 'FEMALE') {
          <path d="M14 58V34c0-12 8-20 18-20s18 8 18 20v24c-6-4-12-5-18-5s-12 1-18 5z" [attr.fill]="colores().pelo" />
        }
        <circle cx="32" cy="27" r="11" [attr.fill]="colores().piel" />
        @if (genero() === 'MALE') {
          <path d="M21 25c0-8 5-12 11-12s11 4 11 12c-3-4-7-5-11-5s-8 1-11 5z" [attr.fill]="colores().pelo" />
        }
        @if (genero() === 'FEMALE') {
          <path d="M21 27c0-9 4-13 11-13s11 4 11 13c-2-5-6-8-11-8s-9 3-11 8z" [attr.fill]="colores().pelo" />
        }
        <path d="M10 64c0-13 10-20 22-20s22 7 22 20z" [attr.fill]="colores().ropa" />
      </svg>
    }
  `,
  styles: [':host { display: inline-flex; flex: none; }'],
})
export class Avatar {
  readonly foto = input<string | null>(null);
  readonly genero = input<Genero | null>(null);
  readonly nombre = input('estudiante');
  readonly tam = input(48);

  readonly colores = computed(() => {
    switch (this.genero()) {
      case 'MALE':
        return { fondo: '#dbe7fb', piel: '#f3c9a5', pelo: '#3b2f2a', ropa: '#4a6fa5' };
      case 'FEMALE':
        return { fondo: '#fbe0ea', piel: '#f3c9a5', pelo: '#5a3a2e', ropa: '#c2547a' };
      default:
        return { fondo: '#e6e8ef', piel: '#d8c2ad', pelo: '#9aa1b4', ropa: '#8b94a9' };
    }
  });
}
