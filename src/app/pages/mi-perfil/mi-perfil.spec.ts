import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MAXIMO_ELEGIDOS, MiPerfil, alternar } from './mi-perfil';

const api = environment.apiUrl;

const perfil = {
  estudianteId: 1,
  nombres: 'Ana',
  apellidos: 'Quispe',
  universidad: 'UTP',
  carrera: 'Ingenieria de Sistemas',
  ciclo: 7,
  descripcion: 'Me gusta programar',
  visibilidad: 'PUBLICO',
  intereses: [{ id: 1, nombre: 'Musica' }],
  habilidades: [],
  restringido: false,
};

const contacto = {
  id: 3,
  estudianteId: 2,
  nombres: 'Luis',
  apellidos: 'Alanya',
  universidad: 'UTP',
  estado: 'ACEPTADA',
  enviadaPorMi: true,
  creadaEn: '2026-10-20T10:00:00Z',
};

describe('MiPerfil', () => {
  let fixture: ComponentFixture<MiPerfil>;
  let http: HttpTestingController;
  let raiz: HTMLElement;

  beforeEach(async () => {
    sessionStorage.clear();
    sessionStorage.setItem('quesale.token', 'abc');
    sessionStorage.setItem(
      'quesale.usuario',
      JSON.stringify({
        estudianteId: 1,
        correo: 'ana@utp.edu.pe',
        nombres: 'Ana',
        apellidos: 'Quispe',
        universidadId: 1,
        universidad: 'UTP',
        rol: 'ESTUDIANTE',
      }),
    );
    await TestBed.configureTestingModule({
      imports: [MiPerfil],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MiPerfil);
    fixture.detectChanges();
    http.expectOne(`${api}/perfil/yo`).flush(perfil);
    http.expectOne(`${api}/catalogos/intereses`).flush([
      { id: 1, nombre: 'Musica' },
      { id: 2, nombre: 'Deportes' },
    ]);
    http.expectOne(`${api}/catalogos/habilidades`).flush([{ id: 5, nombre: 'Java' }]);
    http.expectOne(`${api}/conexiones`).flush([contacto]);
    http.expectOne(`${api}/conexiones/enviadas`).flush([{ ...contacto, id: 4, estado: 'PENDIENTE' }]);
    fixture.detectChanges();
    raiz = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  function boton(texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.trim() === texto) as HTMLButtonElement;
  }

  it('muestra los datos actuales del perfil en el formulario', () => {
    expect((raiz.querySelector('#carrera') as HTMLInputElement).value).toBe('Ingenieria de Sistemas');
    expect((raiz.querySelector('#descripcion') as HTMLTextAreaElement).value).toBe('Me gusta programar');
    expect(raiz.textContent).toContain('Perfil público');
    expect(raiz.textContent).toContain('Intereses (1/10)');
  });

  it('marca como elegidos los intereses que ya tiene el perfil', () => {
    expect(boton('Musica').getAttribute('aria-pressed')).toBe('true');
    expect(boton('Deportes').getAttribute('aria-pressed')).toBe('false');
  });

  it('lista los contactos y las solicitudes enviadas', () => {
    expect(raiz.textContent).toContain('Conexiones (1)');
    expect(raiz.textContent).toContain('Luis Alanya');
    expect(raiz.textContent).toContain('Solicitudes enviadas');
  });

  it('guarda los cambios enviando intereses, habilidades y visibilidad', () => {
    boton('Deportes').click();
    boton('Java').click();
    (raiz.querySelector('button[role="radio"]:nth-of-type(2)') as HTMLButtonElement).click();
    fixture.detectChanges();

    (raiz.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

    const peticion = http.expectOne(`${api}/perfil/yo`);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual({
      carrera: 'Ingenieria de Sistemas',
      ciclo: 7,
      descripcion: 'Me gusta programar',
      visibilidad: 'PRIVADO',
      interesIds: [1, 2],
      habilidadIds: [5],
    });
    peticion.flush({ ...perfil, visibilidad: 'PRIVADO' });
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Cambios guardados');
    expect(raiz.textContent).toContain('Perfil privado');
  });

  it('muestra el error del servidor si no se puede guardar', () => {
    (raiz.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

    http
      .expectOne(`${api}/perfil/yo`)
      .flush({ mensaje: 'Alguno de los intereses elegidos no existe', detalles: [] }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('no existe');
  });

  it('cancela una solicitud enviada y la quita de la lista', () => {
    boton('Cancelar').click();

    http.expectOne(`${api}/conexiones/4/cancelar`).flush({ ...contacto, id: 4, estado: 'CANCELADA' });
    fixture.detectChanges();

    expect(raiz.textContent).not.toContain('Solicitudes enviadas');
  });
});

describe('alternar', () => {
  it('agrega y quita elementos', () => {
    expect(alternar([1], 2)).toEqual([1, 2]);
    expect(alternar([1, 2], 1)).toEqual([2]);
  });

  it('no permite superar el máximo de elegidos', () => {
    const llenos = Array.from({ length: MAXIMO_ELEGIDOS }, (_, i) => i + 1);

    expect(alternar(llenos, 99)).toEqual(llenos);
    expect(alternar(llenos, 3)).toHaveLength(MAXIMO_ELEGIDOS - 1);
  });
});
