import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Inicio } from './inicio';

const api = environment.apiUrl;

const meetup = {
  id: 5,
  titulo: 'Repaso de Base de Datos II',
  descripcion: null,
  tipo: 'ACADEMICO',
  fechaHora: '2026-10-28T18:00:00',
  lugar: 'Biblioteca',
  cupoMaximo: 4,
  confirmados: 1,
  estado: 'PROGRAMADO',
  organizadorId: 2,
  organizador: 'Luis Alanya',
  universidad: 'UTP',
  esOrganizador: false,
  miParticipacion: null,
};

const solicitud = {
  id: 9,
  estudianteId: 3,
  nombres: 'Rosa',
  apellidos: 'Diaz',
  universidad: 'UPC',
  estado: 'PENDIENTE',
  enviadaPorMi: false,
  creadaEn: '2026-10-20T10:00:00Z',
};

const sugerido = {
  estudianteId: 4,
  nombres: 'Eva',
  apellidos: 'Rios',
  universidad: 'UTP',
  carrera: 'Derecho',
  ciclo: 3,
  descripcion: null,
  visibilidad: 'PUBLICO',
  intereses: [],
  habilidades: [],
  restringido: false,
};

describe('Inicio', () => {
  let fixture: ComponentFixture<Inicio>;
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
      imports: [Inicio],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Inicio);
    fixture.detectChanges();
    http.expectOne((r) => r.url === `${api}/meetups`).flush([meetup]);
    http.expectOne(`${api}/perfil/yo`).flush({ ...sugerido, estudianteId: 1, nombres: 'Ana', apellidos: 'Quispe', carrera: 'Sistemas', ciclo: 7 });
    http.expectOne(`${api}/meetups/mios`).flush([{ ...meetup, estado: 'PROGRAMADO' }, { ...meetup, id: 6, estado: 'CANCELADO' }]);
    http.expectOne(`${api}/participaciones/mias`).flush([meetup]);
    http.expectOne(`${api}/conexiones`).flush([solicitud]);
    http.expectOne(`${api}/conexiones/recibidas`).flush([solicitud]);
    http.expectOne((r) => r.url === `${api}/estudiantes`).flush([sugerido]);
    fixture.detectChanges();
    raiz = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  function boton(texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement;
  }

  it('saluda al usuario y muestra su perfil y su actividad', () => {
    const texto = raiz.textContent ?? '';

    expect(texto).toContain('Hola, Ana');
    expect(texto).toContain('Sistemas, Ciclo 7');
    expect(texto).toContain('Meetups que organizas');
  });

  it('cuenta solo los meetups programados que organiza', () => {
    const fila = Array.from(raiz.querySelectorAll('section div')).find((d) =>
      d.textContent?.includes('Meetups que organizas'),
    );

    expect(fila?.textContent?.trim()).toMatch(/Meetups que organizas\s*1$/);
  });

  it('no sugiere a quienes ya son contactos', () => {
    fixture.componentInstance['contactosIds'].set([4]);
    fixture.detectChanges();

    expect(raiz.textContent).not.toContain('Eva Rios');
    expect(raiz.textContent).toContain('Aún no hay perfiles públicos para mostrar');
  });

  it('lista los meetups próximos', () => {
    expect(raiz.querySelectorAll('app-meetup-card')).toHaveLength(1);
    expect(raiz.textContent).toContain('Repaso de Base de Datos II');
  });

  it('pide de nuevo los meetups al elegir el filtro Social', () => {
    boton('Social').click();

    const peticion = http.expectOne((r) => r.url === `${api}/meetups`);
    expect(peticion.request.params.get('tipo')).toBe('SOCIAL');
    peticion.flush([]);
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Todavía no hay meetups programados');
  });

  it('solicita unirse a un meetup y recarga la lista', () => {
    boton('Solicitar unirme').click();

    http.expectOne(`${api}/meetups/5/participaciones`).flush({ id: 1, meetupId: 5, estado: 'SOLICITADA' });
    http.expectOne((r) => r.url === `${api}/meetups`).flush([{ ...meetup, miParticipacion: 'SOLICITADA' }]);
    fixture.detectChanges();

    expect(raiz.textContent).toContain('Solicitud enviada');
  });

  it('acepta una solicitud de conexión y la quita de la lista', () => {
    boton('Aceptar').click();

    http.expectOne(`${api}/conexiones/9/aceptar`).flush({ ...solicitud, estado: 'ACEPTADA' });
    fixture.detectChanges();

    expect(raiz.textContent).toContain('No tienes solicitudes pendientes');
  });

  it('envía una solicitud de conexión a un estudiante sugerido', () => {
    boton('Conectar').click();

    const peticion = http.expectOne(`${api}/conexiones`);
    expect(peticion.request.body).toEqual({ destinatarioId: 4 });
    peticion.flush({ ...solicitud, estudianteId: 4, enviadaPorMi: true });
    fixture.detectChanges();

    expect(raiz.textContent).toContain('Solicitud enviada');
  });

  it('muestra el error del servidor al fallar una acción', () => {
    boton('Solicitar unirme').click();

    http
      .expectOne(`${api}/meetups/5/participaciones`)
      .flush({ mensaje: 'El meetup no tiene cupo disponible', detalles: [] }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('El meetup no tiene cupo disponible');
  });
});
