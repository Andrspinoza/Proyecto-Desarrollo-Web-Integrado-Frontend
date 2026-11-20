import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { metaUniversidad } from '../core/universidades';

@Component({
  selector: 'app-uni-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center justify-center rounded-xl font-display font-bold tracking-tight shrink-0 select-none"
      [style.background]="meta().fondo"
      [style.color]="meta().texto"
      [style.width.px]="tam()"
      [style.height.px]="tam()"
      [style.fontSize.px]="tam() * 0.3"
      [attr.title]="meta().nombre"
      >{{ meta().sigla }}</span
    >
  `,
  styles: [':host { display: inline-flex; flex: none; }'],
})
export class UniBadge {
  readonly dominio = input<string | null>(null);
  readonly tam = input(44);
  readonly meta = computed(() => metaUniversidad(this.dominio()));
}
