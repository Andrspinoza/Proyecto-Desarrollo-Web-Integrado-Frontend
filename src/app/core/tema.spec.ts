import { TestBed } from '@angular/core/testing';
import { TemaService, temaInicial } from './tema';

describe('tema', () => {
  it('respeta lo que eligió el usuario', () => {
    expect(temaInicial('oscuro', false)).toBe('oscuro');
    expect(temaInicial('claro', true)).toBe('claro');
  });

  it('sin elección sigue la preferencia del sistema', () => {
    expect(temaInicial(null, true)).toBe('oscuro');
    expect(temaInicial(null, false)).toBe('claro');
    expect(temaInicial('otro', true)).toBe('oscuro');
  });

  it('alternar cambia la clase del documento y guarda la elección', () => {
    localStorage.removeItem('quesale-tema');
    const temas = TestBed.inject(TemaService);
    const antes = temas.tema();

    temas.alternar();

    const despues = temas.tema();
    expect(despues).not.toBe(antes);
    expect(document.documentElement.classList.contains('oscuro')).toBe(despues === 'oscuro');
    expect(localStorage.getItem('quesale-tema')).toBe(despues);
  });
});
