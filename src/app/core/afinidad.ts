import { Recomendacion } from './api.models';

export function unir(lista: string[]): string {
  const minusculas = lista.map((x) => x.toLowerCase());
  if (minusculas.length <= 1) return minusculas.join('');
  return `${minusculas.slice(0, -1).join(', ')} y ${minusculas[minusculas.length - 1]}`;
}

export function explicarAfinidad(r: Pick<Recomendacion, 'sharedInterests' | 'sharedSkills' | 'sameCareer' | 'sameCampus' | 'cycleDifference'>): string {
  const partes: string[] = [];
  if (r.sharedInterests.length > 0) partes.push(`Comparten ${unir(r.sharedInterests.slice(0, 3))}`);
  if (r.sharedSkills.length > 0) partes.push(`saben de ${unir(r.sharedSkills.slice(0, 2))}`);
  if (r.sameCareer) partes.push('misma carrera');
  if (r.cycleDifference <= 1 && !r.sameCareer) partes.push('ciclos cercanos');
  else if (r.cycleDifference === 0 && r.sameCareer) partes.push('mismo ciclo');
  if (r.sameCampus) partes.push('misma sede');
  if (partes.length === 0) return 'Aún no tienen cosas en común: ¡puede ser la mejor sorpresa!';
  const texto = partes.join(' · ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function nivelAfinidad(porcentaje: number): 'alta' | 'media' | 'baja' {
  if (porcentaje >= 70) return 'alta';
  if (porcentaje >= 35) return 'media';
  return 'baja';
}
