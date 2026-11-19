import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Explorar } from './explorar';

const api = environment.apiUrl;

const meetup = {
  id: 5,
  titulo: 'Pichanga interfacultades',
  descripcion: null,
  tipo: 'SOCIAL',
  fechaHora: '2026-10-28T18:00:00',
  lugar: 'Cancha',
  cupoMaximo: 10,
  confirmados: 2,
  estado: 'PROGRAMADO',
  organizadorId: 2,
  organizador: 'Luis Alanya',
  universidad: 'UTP',
  esOrganizador: false,
  miParticipacion: null,
};

const estudiante = {
  estudianteId: 4,
  nombres: 'Eva',
  apellidos: 'Rios',
  universidad: 'UTP',
  carrera: 'Derecho',
  ciclo: 3,
  descripcion: 'Me gusta debatir',
  visibilidad: 'PUBLICO',
  intereses: [{ id: 1, nombre: 'Lectura' }],
  habilidades: [{ id: 2, nombre: 'Comunicacion' }],
  restringido: false,
};

describe('Explorar', () => {
  let fixture: ComponentFixture<Explorar>;
  let http: HttpTestingController;
  let raiz: HTMLElement;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Explorar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Explorar);
    fixture.detectChanges();
    http.expectOne(`${api}/universities`).flush([{ id: 1, name: 'UTP', emailDomain: 'utp.edu.pe', active: true }]);
    http.expectOne(`${api}/catalogos/intereses`).flush([{ id: 1, nombre: 'Lectura' }]);
    http.expectOne(`${api}/catalogos/habilidades`).flush([{ id: 2, nombre: 'Comunicacion' }]);
    http.expectOne((r) => r.url === `${api}/meetups`).flush([meetup]);
    fixture.detectChanges();
    raiz = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  function pestana(texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll('button[role="tab"]')).find((b) =>
      b.textContent?.includes(texto),
    ) as HTMLButtonElement;
  }

  function boton(texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement;
  }

  function irAEstudiantes(): void {
    pestana('Estudiantes').click();
    http.expectOne((r) => r.url === `${api}/estudiantes`).flush([estudiante]);
    fixture.detectChanges();
  }

  it('muestra los meetups al abrir', () => {
    expect(raiz.querySelectorAll('app-meetup-card')).toHaveLength(1);
    expect(raiz.textContent).toContain('Pichanga interfacultades');
  });

  it('busca meetups con el texto y el tipo elegidos', () => {
    const texto = raiz.querySelector('#texto') as HTMLInputElement;
    texto.value = 'pichanga';
    texto.dispatchEvent(new Event('input'));
    const tipo = raiz.querySelector('#tipo') as HTMLSelectElement;
    tipo.value = 'SOCIAL';
    tipo.dispatchEvent(new Event('change'));

    (raiz.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

    const peticion = http.expectOne((r) => r.url === `${api}/meetups`);
    expect(peticion.request.params.get('texto')).toBe('pichanga');
    expect(peticion.request.params.get('tipo')).toBe('SOCIAL');
    peticion.flush([]);
    fixture.detectChanges();
    expect(raiz.textContent).toContain('No encontramos meetups con esos filtros');
  });

  it('solicita unirse a un meetup y vuelve a buscar', () => {
    boton('Solicitar unirme').click();

    http.expectOne(`${api}/meetups/5/participaciones`).flush({ id: 1, meetupId: 5, estado: 'SOLICITADA' });
    http.expectOne((r) => r.url === `${api}/meetups`).flush([{ ...meetup, miParticipacion: 'SOLICITADA' }]);
    fixture.detectChanges();

    expect(raiz.textContent).toContain('Solicitud enviada');
  });

  it('cambia a estudiantes y lista los perfiles públicos', () => {
    irAEstudiantes();

    expect(raiz.textContent).toContain('Eva Rios');
    expect(raiz.textContent).toContain('Derecho · Ciclo 3');
    expect(raiz.textContent).toContain('Lectura');
  });

  it('filtra estudiantes por carrera y ciclo', () => {
    irAEstudiantes();
    const carrera = raiz.querySelector('#carrera') as HTMLInputElement;
    carrera.value = 'Derecho';
    carrera.dispatchEvent(new Event('input'));
    const ciclo = raiz.querySelector('#ciclo') as HTMLSelectElement;
    ciclo.selectedIndex = 3;
    ciclo.dispatchEvent(new Event('change'));

    (raiz.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

    const peticion = http.expectOne((r) => r.url === `${api}/estudiantes`);
    expect(peticion.request.params.get('carrera')).toBe('Derecho');
    expect(peticion.request.params.get('ciclo')).toBe('3');
    peticion.flush([]);
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Solo aparecen perfiles públicos');
  });

  it('despliega el detalle del perfil con su biografía y habilidades', () => {
    irAEstudiantes();

    boton('Ver perfil').click();
    fixture.detectChanges();

    expect(raiz.textContent).toContain('Me gusta debatir');
    expect(raiz.textContent).toContain('Comunicacion');
  });

  it('envía una solicitud de conexión', () => {
    irAEstudiantes();

    boton('Conectar').click();

    const peticion = http.expectOne(`${api}/conexiones`);
    expect(peticion.request.body).toEqual({ destinatarioId: 4 });
    peticion.flush({ id: 1, estudianteId: 4, nombres: 'Eva', apellidos: 'Rios', universidad: 'UTP', estado: 'PENDIENTE', enviadaPorMi: true, creadaEn: '2026-10-26T10:00:00Z' });
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Solicitud enviada');
  });
});
