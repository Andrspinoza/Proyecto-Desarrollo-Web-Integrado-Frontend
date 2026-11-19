import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { ConexionService } from './conexion.service';
import { MeetupService } from './meetup.service';
import { PerfilService, parametros } from './perfil.service';

describe('servicios de datos', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('parametros omite los filtros vacíos', () => {
    const params = parametros({ carrera: 'Sistemas', ciclo: undefined, texto: '  ', tipo: null, id: 0 });

    expect(params.keys().sort()).toEqual(['carrera', 'id']);
    expect(params.get('id')).toBe('0');
  });

  it('PerfilService busca estudiantes con los filtros enviados', () => {
    TestBed.inject(PerfilService).buscar({ carrera: 'Derecho', ciclo: 3 }).subscribe();

    const peticion = http.expectOne((r) => r.url === `${environment.apiUrl}/estudiantes`);
    expect(peticion.request.params.get('carrera')).toBe('Derecho');
    expect(peticion.request.params.get('ciclo')).toBe('3');
    peticion.flush([]);
  });

  it('PerfilService actualiza el perfil propio con PUT', () => {
    TestBed.inject(PerfilService)
      .actualizar({ carrera: null, ciclo: null, descripcion: null, visibilidad: 'PUBLICO', interesIds: [], habilidadIds: [] })
      .subscribe();

    const peticion = http.expectOne(`${environment.apiUrl}/perfil/yo`);
    expect(peticion.request.method).toBe('PUT');
    peticion.flush({});
  });

  it('MeetupService solicita y se retira de un meetup', () => {
    const servicio = TestBed.inject(MeetupService);

    servicio.solicitar(5).subscribe();
    const solicitud = http.expectOne(`${environment.apiUrl}/meetups/5/participaciones`);
    expect(solicitud.request.method).toBe('POST');
    solicitud.flush({});

    servicio.retirar(5).subscribe();
    const retiro = http.expectOne(`${environment.apiUrl}/meetups/5/participaciones/yo`);
    expect(retiro.request.method).toBe('DELETE');
    retiro.flush({});
  });

  it('MeetupService aprueba una solicitud y exporta como blob', () => {
    const servicio = TestBed.inject(MeetupService);

    servicio.aprobar(9).subscribe();
    http.expectOne(`${environment.apiUrl}/participaciones/9/aprobar`).flush({});

    servicio.exportar(5).subscribe();
    const exportacion = http.expectOne(`${environment.apiUrl}/meetups/5/participantes/exportar`);
    expect(exportacion.request.responseType).toBe('blob');
    exportacion.flush(new Blob());
  });

  it('ConexionService envía el destinatario en el cuerpo', () => {
    TestBed.inject(ConexionService).solicitar(7).subscribe();

    const peticion = http.expectOne(`${environment.apiUrl}/conexiones`);
    expect(peticion.request.body).toEqual({ destinatarioId: 7 });
    peticion.flush({});
  });
});
