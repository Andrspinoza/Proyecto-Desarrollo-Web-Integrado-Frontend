import { computed, signal } from '@angular/core';
import { EstudianteApi, Genero, PerfilDatos, Visibilidad } from './api.models';

export const MAX_ITEMS = 15;

export function edadDesde(nacimiento: string, hoy: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nacimiento)) return null;
  const [anio, mes, dia] = nacimiento.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;
  let edad = hoy.getFullYear() - anio;
  const cumplio = hoy.getMonth() > mes - 1 || (hoy.getMonth() === mes - 1 && hoy.getDate() >= dia);
  if (!cumplio) edad -= 1;
  return edad;
}

export function errorDeNacimiento(nacimiento: string, hoy: Date = new Date()): string | null {
  if (!nacimiento) return 'Indica tu fecha de nacimiento.';
  const edad = edadDesde(nacimiento, hoy);
  if (edad === null) return 'La fecha no es válida.';
  if (edad < 16) return 'Debes tener al menos 16 años.';
  if (edad > 100) return 'Revisa la fecha de nacimiento.';
  return null;
}

export function alternar(lista: number[], id: number, maximo = MAX_ITEMS): number[] {
  if (lista.includes(id)) return lista.filter((x) => x !== id);
  return lista.length >= maximo ? lista : [...lista, id];
}

export class PerfilEstado {
  readonly carrera = signal('');
  readonly ciclo = signal<number | null>(null);
  readonly sede = signal('');
  readonly genero = signal<Genero>('UNDISCLOSED');
  readonly nacimiento = signal('');
  readonly descripcion = signal('');
  readonly visibilidad = signal<Visibilidad>('PUBLIC');
  readonly intereses = signal<number[]>([]);
  readonly habilidades = signal<number[]>([]);

  readonly edad = computed(() => edadDesde(this.nacimiento()));
  readonly errorNacimiento = computed(() => errorDeNacimiento(this.nacimiento()));
  readonly datosPersonalesValidos = computed(() => this.errorNacimiento() === null);
  readonly academicoValido = computed(() => this.carrera().trim().length > 0 && this.ciclo() !== null);
  readonly completo = computed(() => this.datosPersonalesValidos() && this.academicoValido());

  cargar(yo: EstudianteApi): void {
    const perfil = yo.profile;
    if (perfil === null) return;
    this.carrera.set(perfil.career);
    this.ciclo.set(perfil.cycle);
    this.sede.set(perfil.campus ?? '');
    this.genero.set(perfil.gender ?? 'UNDISCLOSED');
    this.nacimiento.set(perfil.birthDate ?? '');
    this.descripcion.set(perfil.description ?? '');
    this.visibilidad.set(perfil.visibility ?? 'PUBLIC');
    this.intereses.set([...perfil.interestIds]);
    this.habilidades.set([...perfil.skillIds]);
  }

  datos(): PerfilDatos {
    return {
      career: this.carrera().trim(),
      cycle: this.ciclo() ?? 1,
      description: this.descripcion().trim(),
      visibility: this.visibilidad(),
      gender: this.genero(),
      birthDate: this.nacimiento() || null,
      campus: this.sede().trim(),
      interestIds: this.intereses(),
      skillIds: this.habilidades(),
    };
  }
}
