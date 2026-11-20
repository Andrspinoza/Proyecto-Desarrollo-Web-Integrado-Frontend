import { explicarAfinidad, nivelAfinidad, unir } from './afinidad';

const base = { sharedInterests: [], sharedSkills: [], sameCareer: false, sameCampus: false, cycleDifference: 5 };

describe('afinidad', () => {
  it('une una lista con comas y «y»', () => {
    expect(unir([])).toBe('');
    expect(unir(['Café'])).toBe('café');
    expect(unir(['Café', 'Vóley'])).toBe('café y vóley');
    expect(unir(['Café', 'Vóley', 'Anime'])).toBe('café, vóley y anime');
  });

  it('explica por qué dos personas son afines', () => {
    const texto = explicarAfinidad({ ...base, sharedInterests: ['Café', 'Vóley'], sharedSkills: ['Programación'], sameCareer: true, sameCampus: true, cycleDifference: 0 });

    expect(texto).toBe('Comparten café y vóley · saben de programación · misma carrera · mismo ciclo · misma sede');
  });

  it('menciona ciclos cercanos solo cuando no comparten carrera', () => {
    expect(explicarAfinidad({ ...base, cycleDifference: 1 })).toBe('Ciclos cercanos');
    expect(explicarAfinidad({ ...base, sameCareer: true, cycleDifference: 1 })).toBe('Misma carrera');
  });

  it('limita a tres intereses y dos habilidades', () => {
    const texto = explicarAfinidad({ ...base, sharedInterests: ['a', 'b', 'c', 'd'], sharedSkills: ['x', 'y', 'z'] });

    expect(texto).toBe('Comparten a, b y c · saben de x y y');
  });

  it('con nada en común anima en lugar de dejar el texto vacío', () => {
    expect(explicarAfinidad(base)).toContain('sorpresa');
  });

  it('clasifica el porcentaje', () => {
    expect(nivelAfinidad(92)).toBe('alta');
    expect(nivelAfinidad(70)).toBe('alta');
    expect(nivelAfinidad(69)).toBe('media');
    expect(nivelAfinidad(35)).toBe('media');
    expect(nivelAfinidad(34)).toBe('baja');
    expect(nivelAfinidad(0)).toBe('baja');
  });
});
