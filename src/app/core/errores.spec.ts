import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDe } from './errores';

describe('mensajeDe', () => {
  it('une los detalles de validación del servidor', () => {
    const error = new HttpErrorResponse({ status: 400, error: { mensaje: 'Datos invalidos', detalles: ['a', 'b'] } });

    expect(mensajeDe(error)).toBe('a. b');
  });

  it('usa el mensaje del servidor cuando no hay detalles', () => {
    expect(mensajeDe(new HttpErrorResponse({ status: 409, error: { mensaje: 'Ya existe', detalles: [] } }))).toBe(
      'Ya existe',
    );
  });

  it('avisa cuando no hay conexión', () => {
    expect(mensajeDe(new HttpErrorResponse({ status: 0 }))).toBe('No hay conexión con el servidor');
  });
});
