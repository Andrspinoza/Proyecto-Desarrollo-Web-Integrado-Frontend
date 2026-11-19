import { formatearFecha, hayCupo, iniciales, nombreCompleto } from './formato';

describe('formato', () => {
  it('formatearFecha incluye el día y la hora', () => {
    const texto = formatearFecha('2026-10-28T18:30:00');

    expect(texto).toContain('28');
    expect(texto).toMatch(/0?6[:.]30/);
  });

  it('nombreCompleto une nombres y apellidos', () => {
    expect(nombreCompleto({ nombres: 'Ana', apellidos: 'Quispe' })).toBe('Ana Quispe');
  });

  it('iniciales toma la primera letra de cada parte en mayúscula', () => {
    expect(iniciales({ nombres: 'ana', apellidos: 'quispe' })).toBe('AQ');
  });

  it('hayCupo es verdadero solo mientras hay lugares libres', () => {
    expect(hayCupo({ confirmados: 1, cupoMaximo: 2 })).toBe(true);
    expect(hayCupo({ confirmados: 2, cupoMaximo: 2 })).toBe(false);
  });
});
