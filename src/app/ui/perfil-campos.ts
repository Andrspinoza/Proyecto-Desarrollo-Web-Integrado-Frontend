import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Genero, ItemCatalogo } from '../core/api.models';
import { MAX_ITEMS, PerfilEstado, alternar } from '../core/perfil-estado';
import { CARRERAS } from '../core/universidades';
import { Avatar } from './avatar';

@Component({
  selector: 'app-campos-personales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar],
  template: `
    <fieldset class="border-0 p-0 m-0">
      <legend class="label">¿Cómo te identificas?</legend>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        @for (g of generos; track g.valor) {
          <label class="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-line cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft text-center">
            <input type="radio" name="genero" class="sr-only" [checked]="estado().genero() === g.valor" (change)="estado().genero.set(g.valor)" />
            <app-avatar [genero]="g.valor" [nombre]="g.texto" [tam]="44" />
            <span class="text-xs font-bold">{{ g.texto }}</span>
          </label>
        }
      </div>
      <p class="text-xs text-muted mt-2 mb-0">Se usa para tu imagen por defecto cuando no tienes foto.</p>
    </fieldset>
    <div class="mt-4">
      <label class="label" for="nacimiento">Fecha de nacimiento</label>
      <input id="nacimiento" type="date" class="field" [value]="estado().nacimiento()" (input)="estado().nacimiento.set($any($event.target).value)" />
      @if (estado().nacimiento() && estado().errorNacimiento()) { <p class="error-text mt-1 mb-0">{{ estado().errorNacimiento() }}</p> }
      @else if (estado().edad() !== null) { <p class="text-xs text-muted mt-1 mb-0">Tendrás {{ estado().edad() }} años en tu perfil. Tu fecha no se muestra a nadie.</p> }
    </div>
  `,
})
export class CamposPersonales {
  readonly estado = input.required<PerfilEstado>();
  protected readonly generos: { valor: Genero; texto: string }[] = [
    { valor: 'MALE', texto: 'Hombre' },
    { valor: 'FEMALE', texto: 'Mujer' },
    { valor: 'OTHER', texto: 'Otro' },
    { valor: 'UNDISCLOSED', texto: 'Prefiero no decirlo' },
  ];
}

@Component({
  selector: 'app-campos-academicos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label class="label" for="carrera">Carrera</label>
      <input id="carrera" class="field" list="carreras" autocomplete="off" placeholder="Ej. Ingeniería de Sistemas" [value]="estado().carrera()" (input)="estado().carrera.set($any($event.target).value)" />
      <datalist id="carreras">@for (c of carreras; track c) { <option [value]="c"></option> }</datalist>
    </div>
    <fieldset class="border-0 p-0 m-0 mt-4">
      <legend class="label">Ciclo</legend>
      <div class="flex flex-wrap gap-2">
        @for (n of ciclos; track n) {
          <button type="button" class="chip !min-h-10 !min-w-10 !justify-center !text-sm cursor-pointer" [class.chip-on]="estado().ciclo() === n" [attr.aria-pressed]="estado().ciclo() === n" (click)="estado().ciclo.set(n)">{{ n }}</button>
        }
      </div>
    </fieldset>
    <div class="mt-4">
      <label class="label" for="sede">Sede</label>
      <input id="sede" class="field" list="sedes" autocomplete="off" placeholder="Ej. Lima Centro" [value]="estado().sede()" (input)="estado().sede.set($any($event.target).value)" />
      <datalist id="sedes">@for (s of sedes(); track s) { <option [value]="s"></option> }</datalist>
      <p class="text-xs text-muted mt-1 mb-0">La usamos para sugerirte gente de tu misma sede.</p>
    </div>
  `,
})
export class CamposAcademicos {
  readonly estado = input.required<PerfilEstado>();
  readonly sedes = input<string[]>([]);
  protected readonly carreras = CARRERAS;
  protected readonly ciclos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}

@Component({
  selector: 'app-campos-gustos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-baseline justify-between"><h3 class="label !mb-2 !text-sm">Intereses</h3><span class="text-xs text-muted">{{ estado().intereses().length }}/{{ max }}</span></div>
      <div class="flex flex-wrap gap-2">
        @for (i of intereses(); track i.id) {
          <button type="button" class="chip cursor-pointer !min-h-9" [class.chip-on]="estado().intereses().includes(i.id)" [attr.aria-pressed]="estado().intereses().includes(i.id)" (click)="estado().intereses.set(alternar(estado().intereses(), i.id))">{{ i.name }}</button>
        }
      </div>
    </div>
    <div class="mt-5">
      <div class="flex items-baseline justify-between"><h3 class="label !mb-2 !text-sm">Habilidades</h3><span class="text-xs text-muted">{{ estado().habilidades().length }}/{{ max }}</span></div>
      <div class="flex flex-wrap gap-2">
        @for (h of habilidades(); track h.id) {
          <button type="button" class="chip cursor-pointer !min-h-9" [class.chip-on]="estado().habilidades().includes(h.id)" [attr.aria-pressed]="estado().habilidades().includes(h.id)" (click)="estado().habilidades.set(alternar(estado().habilidades(), h.id))">{{ h.name }}</button>
        }
      </div>
    </div>
  `,
})
export class CamposGustos {
  readonly estado = input.required<PerfilEstado>();
  readonly intereses = input<ItemCatalogo[]>([]);
  readonly habilidades = input<ItemCatalogo[]>([]);
  protected readonly max = MAX_ITEMS;
  protected readonly alternar = alternar;
}

@Component({
  selector: 'app-campos-sobre-ti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label class="label" for="descripcion">Cuéntanos sobre ti</label>
      <textarea id="descripcion" class="field" maxlength="500" placeholder="Qué te gusta hacer, qué buscas conocer…" [value]="estado().descripcion()" (input)="estado().descripcion.set($any($event.target).value)"></textarea>
      <p class="text-xs text-muted mt-1 mb-0 text-right">{{ estado().descripcion().length }}/500</p>
    </div>
    <fieldset class="border-0 p-0 m-0 mt-4">
      <legend class="label">¿Quién puede ver tu perfil?</legend>
      <div class="grid sm:grid-cols-2 gap-2">
        <label class="p-3 rounded-xl border border-line cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
          <input type="radio" name="visibilidad" class="sr-only" [checked]="estado().visibilidad() === 'PUBLIC'" (change)="estado().visibilidad.set('PUBLIC')" />
          <span class="flex items-center gap-2 font-bold text-sm"><span class="icon !text-[20px]">public</span> Público</span>
          <span class="block text-xs text-muted mt-1">Aparecerás en las sugerencias de tu universidad.</span>
        </label>
        <label class="p-3 rounded-xl border border-line cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
          <input type="radio" name="visibilidad" class="sr-only" [checked]="estado().visibilidad() === 'PRIVATE'" (change)="estado().visibilidad.set('PRIVATE')" />
          <span class="flex items-center gap-2 font-bold text-sm"><span class="icon !text-[20px]">lock</span> Privado</span>
          <span class="block text-xs text-muted mt-1">No aparecerás en sugerencias; solo tus conexiones ven tu perfil completo.</span>
        </label>
      </div>
    </fieldset>
  `,
})
export class CamposSobreTi {
  readonly estado = input.required<PerfilEstado>();
}
