import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { metaUniversidad } from '../core/universidades';

@Component({
  selector: 'app-uni-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (conLogo()) {
      <span
        class="inline-flex items-center justify-center rounded-xl bg-white border border-line shrink-0 overflow-hidden"
        [style.width.px]="tam()"
        [style.height.px]="tam()"
        [style.padding.px]="tam() * 0.1"
        [attr.title]="meta().nombre"
      >
        <img [src]="meta().logo" [alt]="meta().nombre" class="w-full h-full object-contain" loading="lazy" (error)="logoFallido.set(meta().logo)" />
      </span>
    } @else {
      <span
        class="inline-flex items-center justify-center rounded-xl font-display font-bold tracking-tight shrink-0 select-none"
        [style.background]="meta().fondo"
        [style.color]="meta().texto"
        [style.width.px]="tam()"
        [style.height.px]="tam()"
        [style.fontSize.px]="tam() * (meta().sigla.length > 4 ? 0.24 : 0.3)"
        [attr.title]="meta().nombre"
        >{{ meta().sigla }}</span
      >
    }
  `,
  styles: [':host { display: inline-flex; flex: none; }'],
})
export class UniBadge {
  readonly dominio = input<string | null>(null);
  readonly tam = input(44);
  readonly meta = computed(() => metaUniversidad(this.dominio()));
  protected readonly logoFallido = signal<string | null>(null);
  protected readonly conLogo = computed(() => {
    const logo = this.meta().logo;
    return logo !== null && logo !== this.logoFallido();
  });
}
