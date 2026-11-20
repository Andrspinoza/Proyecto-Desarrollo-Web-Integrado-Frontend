import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Recomendacion } from '../core/api.models';
import { explicarAfinidad, nivelAfinidad } from '../core/afinidad';
import { Avatar } from './avatar';

@Component({
  selector: 'app-persona-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar],
  template: `
    <article class="card overflow-hidden pop">
      <div class="relative bg-gradient-to-br from-brand-soft to-[#f5f3f8] p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        <span class="rounded-full ring-[6px] ring-white shadow-lg"><app-avatar [foto]="r().photoUrl" [genero]="r().gender" [nombre]="r().firstName" [tam]="120" /></span>
        <div class="text-center sm:text-left min-w-0 flex-1">
          <h2 class="font-display font-extrabold text-2xl sm:text-3xl m-0 leading-tight break-words">{{ r().firstName }} {{ r().lastName.charAt(0) }}.@if (r().age !== null) {<span class="font-semibold text-muted">, {{ r().age }}</span>}</h2>
          <p class="text-muted font-semibold mt-1 mb-0">{{ r().career }} · ciclo {{ r().cycle }}</p>
          @if (r().campus) { <p class="text-sm text-muted mt-0.5 mb-0 flex items-center justify-center sm:justify-start gap-1"><span class="icon !text-[16px]">location_on</span>{{ r().campus }}</p> }
        </div>
        <div class="flex flex-col items-center shrink-0" [attr.aria-label]="'Afinidad ' + r().affinityPercent + ' por ciento'">
          <div class="relative w-[86px] h-[86px] rounded-full grid place-items-center" [style.background]="anillo()">
            <div class="w-[68px] h-[68px] rounded-full bg-white grid place-items-center">
              <span class="font-display font-extrabold text-2xl leading-none" [class.text-brand]="nivel() !== 'baja'" [class.text-muted]="nivel() === 'baja'">{{ r().affinityPercent }}%</span>
            </div>
          </div>
          <span class="text-[11px] font-bold text-muted mt-1.5 uppercase tracking-wide">Afinidad {{ nivel() }}</span>
        </div>
      </div>

      <div class="p-5 sm:p-7">
        <p class="m-0 font-semibold text-ink flex items-start gap-2"><span class="icon icon-fill text-brand !text-[20px] mt-0.5">auto_awesome</span>{{ explicacion() }}</p>
        @if (r().description) { <p class="text-muted mt-3 mb-0 leading-relaxed">{{ r().description }}</p> }
        @if (r().interests.length > 0) {
          <div class="flex flex-wrap gap-2 mt-4">
            @for (i of r().interests; track i) { <span class="chip" [class.chip-on]="r().sharedInterests.includes(i)">{{ i }}</span> }
          </div>
        }
        <div class="grid grid-cols-3 gap-2 mt-6">
          <button type="button" class="btn btn-ghost !min-h-12" (click)="pasar.emit()"><span class="icon">close</span><span class="hidden sm:inline">Pasar</span><span class="sm:hidden">Pasar</span></button>
          <button type="button" class="btn btn-ghost !min-h-12" (click)="ver.emit()"><span class="icon">person</span>Perfil</button>
          <button type="button" class="btn btn-primary !min-h-12" [disabled]="ocupado()" (click)="interesa.emit()"><span class="icon icon-fill">favorite</span>Me interesa</button>
        </div>
      </div>
    </article>
  `,
})
export class PersonaCard {
  readonly r = input.required<Recomendacion>();
  readonly ocupado = input(false);
  readonly pasar = output<void>();
  readonly ver = output<void>();
  readonly interesa = output<void>();

  protected readonly nivel = computed(() => nivelAfinidad(this.r().affinityPercent));
  protected readonly explicacion = computed(() => explicarAfinidad(this.r()));
  protected readonly anillo = computed(() => `conic-gradient(var(--color-brand) ${this.r().affinityPercent * 3.6}deg, #ece7f1 0)`);
}
