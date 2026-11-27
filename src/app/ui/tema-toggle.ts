import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TemaService } from '../core/tema';

@Component({
  selector: 'app-tema-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="btn btn-ghost !min-h-10 !w-10 !px-0" [attr.aria-label]="etiqueta()" [attr.title]="etiqueta()" (click)="temas.alternar()">
      <span class="icon">{{ oscuro() ? 'light_mode' : 'dark_mode' }}</span>
    </button>
  `,
  styles: [':host { display: inline-flex; }'],
})
export class TemaToggle {
  protected readonly temas = inject(TemaService);
  protected readonly oscuro = computed(() => this.temas.tema() === 'oscuro');
  protected readonly etiqueta = computed(() => (this.oscuro() ? 'Activar modo claro' : 'Activar modo oscuro'));
}
