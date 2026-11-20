import { EstudianteApi } from './api.models';
import { PerfilEstado, alternar, edadDesde, errorDeNacimiento } from './perfil-estado';

const HOY = new Date(2026, 10, 20);

describe('edad y fecha de nacimiento', () => {
  it('calcula la edad cumplida', () => {
    expect(edadDesde('2003-11-20', HOY)).toBe(23);
    expect(edadDesde('2003-11-21', HOY)).toBe(22);
    expect(edadDesde('2003-05-10', HOY)).toBe(23);
  });

  it('rechaza fechas con formato o calendario inválidos', () => {
    expect(edadDesde('10/05/2003', HOY)).toBeNull();
    expect(edadDesde('2003-02-30', HOY)).toBeNull();
    expect(edadDesde('', HOY)).toBeNull();
  });

  it('exige entre 16 y 100 años', () => {
    expect(errorDeNacimiento('', HOY)).toContain('fecha');
    expect(errorDeNacimiento('2015-01-01', HOY)).toContain('16');
    expect(errorDeNacimiento('1900-01-01', HOY)).toContain('Revisa');
    expect(errorDeNacimiento('2010-11-20', HOY)).toBe(null);
    expect(errorDeNacimiento('2002-03-04', HOY)).toBe(null);
  });
});

describe('alternar', () => {
  it('agrega y quita ids', () => {
    expect(alternar([], 1)).toEqual([1]);
    expect(alternar([1, 2], 1)).toEqual([2]);
  });

  it('respeta el máximo sin agregar de más', () => {
    const lleno = Array.from({ length: 15 }, (_, i) => i + 1);

    expect(alternar(lleno, 99)).toEqual(lleno);
    expect(alternar(lleno, 3)).not.toContain(3);
  });
});

describe('PerfilEstado', () => {
  it('no está completo hasta tener fecha, carrera y ciclo', () => {
    const estado = new PerfilEstado();
    expect(estado.completo()).toBe(false);

    estado.nacimiento.set('2002-03-04');
    expect(estado.datosPersonalesValidos()).toBe(true);
    expect(estado.completo()).toBe(false);

    estado.carrera.set('Ingeniería de Sistemas');
    estado.ciclo.set(7);
    expect(estado.completo()).toBe(true);
  });

  it('arma los datos para la API recortando espacios', () => {
    const estado = new PerfilEstado();
    estado.carrera.set('  Derecho ');
    estado.ciclo.set(3);
    estado.sede.set(' Lima Norte ');
    estado.genero.set('FEMALE');
    estado.nacimiento.set('2004-01-15');
    estado.descripcion.set(' Hola ');
    estado.intereses.set([1, 2]);

    expect(estado.datos()).toEqual({
      career: 'Derecho', cycle: 3, description: 'Hola', visibility: 'PUBLIC', gender: 'FEMALE',
      birthDate: '2004-01-15', campus: 'Lima Norte', interestIds: [1, 2], skillIds: [],
    });
  });

  it('carga un perfil existente', () => {
    const yo = {
      id: 1, firstName: 'Luis', lastName: 'Alanya', photoUrl: null,
      profile: { career: 'Sistemas', cycle: 7, description: 'x', visibility: 'PRIVATE', interestIds: [4], skillIds: [2], gender: 'MALE', age: 24, campus: 'Lima Centro', birthDate: '2002-03-04' },
    } as unknown as EstudianteApi;
    const estado = new PerfilEstado();

    estado.cargar(yo);

    expect(estado.carrera()).toBe('Sistemas');
    expect(estado.visibilidad()).toBe('PRIVATE');
    expect(estado.intereses()).toEqual([4]);
    expect(estado.genero()).toBe('MALE');
  });

  it('un perfil nulo deja el estado intacto', () => {
    const estado = new PerfilEstado();
    estado.cargar({ id: 1, firstName: 'A', lastName: 'B', profile: null } as unknown as EstudianteApi);

    expect(estado.carrera()).toBe('');
  });
});
