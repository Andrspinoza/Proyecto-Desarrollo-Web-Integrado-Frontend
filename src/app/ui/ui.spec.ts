import { TestBed } from '@angular/core/testing';
import { Avatar } from './avatar';
import { LADO_FOTO, recorteCuadrado, tipoPermitido } from './foto-selector';
import { UniBadge } from './uni-badge';
import { ahoraLocal, fechaFutura } from '../pages/planes/planes';

describe('Avatar', () => {
  it('muestra la foto cuando existe', () => {
    const fixture = TestBed.createComponent(Avatar);
    fixture.componentRef.setInput('foto', '/api/v1/photos/abc');
    fixture.componentRef.setInput('nombre', 'Camila');
    fixture.detectChanges();

    const imagen = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(imagen.getAttribute('src')).toBe('/api/v1/photos/abc');
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('dibuja un monigote según el género cuando no hay foto', () => {
    for (const genero of ['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED', null] as const) {
      const fixture = TestBed.createComponent(Avatar);
      fixture.componentRef.setInput('genero', genero);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
    }
  });

  it('el monigote femenino y el masculino se distinguen', () => {
    const colores = (genero: 'MALE' | 'FEMALE') => {
      const fixture = TestBed.createComponent(Avatar);
      fixture.componentRef.setInput('genero', genero);
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('svg').innerHTML as string;
    };

    expect(colores('MALE')).not.toBe(colores('FEMALE'));
  });
});

describe('UniBadge', () => {
  it('muestra el logo de una universidad conocida', () => {
    const fixture = TestBed.createComponent(UniBadge);
    fixture.componentRef.setInput('dominio', 'pucp.edu.pe');
    fixture.detectChanges();

    const imagen = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(imagen.getAttribute('src')).toBe('universidades/pucp.svg');
    expect(imagen.getAttribute('alt')).toBe('Pontificia Universidad Católica del Perú');
  });

  it('vuelve a la sigla si el logo no carga', () => {
    const fixture = TestBed.createComponent(UniBadge);
    fixture.componentRef.setInput('dominio', 'pucp.edu.pe');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('img') as HTMLImageElement).dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('PUCP');
  });

  it('muestra la sigla de una universidad sin logo', () => {
    const fixture = TestBed.createComponent(UniBadge);
    fixture.componentRef.setInput('dominio', 'unalm.edu.pe');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('UNALM');
  });
});

describe('foto de perfil', () => {
  it('recorta un cuadrado centrado', () => {
    expect(recorteCuadrado(1000, 600)).toEqual({ x: 200, y: 0, lado: 600 });
    expect(recorteCuadrado(600, 1000)).toEqual({ x: 0, y: 200, lado: 600 });
    expect(recorteCuadrado(500, 500)).toEqual({ x: 0, y: 0, lado: 500 });
  });

  it('solo acepta JPG, PNG y WebP', () => {
    expect(tipoPermitido('image/jpeg')).toBe(true);
    expect(tipoPermitido('image/png')).toBe(true);
    expect(tipoPermitido('image/webp')).toBe(true);
    expect(tipoPermitido('image/gif')).toBe(false);
    expect(tipoPermitido('application/pdf')).toBe(false);
    expect(LADO_FOTO).toBe(512);
  });
});

describe('fechas de los planes', () => {
  it('acepta solo fechas futuras', () => {
    const ahora = new Date('2026-11-20T12:00:00').getTime();

    expect(fechaFutura('2026-11-20T13:00', ahora)).toBe(true);
    expect(fechaFutura('2026-11-20T11:00', ahora)).toBe(false);
    expect(fechaFutura('', ahora)).toBe(false);
    expect(fechaFutura('no-es-fecha', ahora)).toBe(false);
  });

  it('el mínimo sugerido tiene formato datetime-local y es futuro', () => {
    expect(ahoraLocal()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(fechaFutura(ahoraLocal())).toBe(true);
  });
});
