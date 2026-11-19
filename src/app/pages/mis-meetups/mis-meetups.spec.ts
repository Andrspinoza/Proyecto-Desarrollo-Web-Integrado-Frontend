import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MisMeetups } from './mis-meetups';

const api = environment.apiUrl;

const propio = {
  id: 5,
  titulo: 'Repaso de Base de Datos II',
  descripcion: null,
  tipo: 'ACADEMICO',
  fechaHora: '2026-10-28T18:00:00',
  lugar: 'Biblioteca',
  cupoMaximo: 4,
  confirmados: 0,
  estado: 'PROGRAMADO',
  organizadorId: 1,
  organizador: 'Ana Quispe',
  universidad: 'UTP',
  esOrganizador: true,
  miParticipacion: null,
};

const ajeno = { ...propio, id: 8, titulo: 'Pichanga', esOrganizador: false, miParticipacion: 'CONFIRMADA', organizador: 'Luis Alanya' };

const solicitante = {
  participacionId: 11,
  estudianteId: 4,
  nombres: 'Eva',
  apellidos: 'Rios',
  universidad: 'UTP',
  estado: 'SOLICITADA',
  registradaEn: '2026-10-26T10:00:00Z',
};

describe('MisMeetups', () => {
  let fixture: ComponentFixture<MisMeetups>;
  let http: HttpTestingController;
  let raiz: HTMLElement;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MisMeetups],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MisMeetups);
    fixture.detectChanges();
    http.expectOne(`${api}/meetups/mios`).flush([propio]);
    http.expectOne(`${api}/participaciones/mias`).flush([ajeno]);
    fixture.detectChanges();
    raiz = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  function boton(texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement;
  }

  function recargar(): void {
    http.expectOne(`${api}/meetups/mios`).flush([propio]);
    http.expectOne(`${api}/participaciones/mias`).flush([ajeno]);
    fixture.detectChanges();
  }

  it('muestra los meetups que organiza y los contadores de cada pestaña', () => {
    expect(raiz.textContent).toContain('Organizo (1)');
    expect(raiz.textContent).toContain('Participo (1)');
    expect(raiz.textContent).toContain('Repaso de Base de Datos II');
  });

  it('cambia a la pestaña de participación y permite retirarse', () => {
    boton('Participo').click();
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Pichanga');

    boton('Confirmado · Retirarme').click();

    http.expectOne(`${api}/meetups/8/participaciones/yo`).flush({ id: 1, meetupId: 8, estado: 'RETIRADA' });
    recargar();
  });

  it('abre el modal de creación y lo cierra', () => {
    boton('Crear meetup').click();
    fixture.detectChanges();
    expect(raiz.querySelector('app-meetup-formulario')).not.toBeNull();

    (raiz.querySelector('button[aria-label="Cerrar"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(raiz.querySelector('app-meetup-formulario')).toBeNull();
  });

  it('abre el modal con los datos del meetup al editar', () => {
    boton('Editar').click();
    fixture.detectChanges();

    expect((raiz.querySelector('#titulo') as HTMLInputElement).value).toBe('Repaso de Base de Datos II');
  });

  it('cancela un meetup y recarga la lista', () => {
    boton('Cancelar meetup').click();

    http.expectOne(`${api}/meetups/5/cancelar`).flush({ ...propio, estado: 'CANCELADO' });
    http.expectOne(`${api}/meetups/mios`).flush([{ ...propio, estado: 'CANCELADO' }]);
    http.expectOne(`${api}/participaciones/mias`).flush([]);
    fixture.detectChanges();

    expect(raiz.textContent).toContain('Cancelado');
    expect(raiz.textContent).not.toContain('Cancelar meetup');
  });

  it('muestra los participantes y aprueba una solicitud', () => {
    boton('Participantes').click();
    http.expectOne(`${api}/meetups/5/participantes`).flush([solicitante]);
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Eva Rios');

    boton('Aprobar').click();

    http.expectOne(`${api}/participaciones/11/aprobar`).flush({ id: 11, meetupId: 5, estado: 'CONFIRMADA' });
    http.expectOne(`${api}/meetups/5/participantes`).flush([{ ...solicitante, estado: 'CONFIRMADA' }]);
    recargar();
    expect(raiz.textContent).toContain('Confirmado');
  });

  it('rechaza una solicitud', () => {
    boton('Participantes').click();
    http.expectOne(`${api}/meetups/5/participantes`).flush([solicitante]);
    fixture.detectChanges();

    boton('Rechazar').click();

    http.expectOne(`${api}/participaciones/11/rechazar`).flush({ id: 11, meetupId: 5, estado: 'RECHAZADA' });
    http.expectOne(`${api}/meetups/5/participantes`).flush([{ ...solicitante, estado: 'RECHAZADA' }]);
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Rechazado');
  });

  it('descarga el Excel de participantes', () => {
    const crear = vi.fn(() => 'blob:prueba');
    const revocar = vi.fn();
    Object.assign(URL, { createObjectURL: crear, revokeObjectURL: revocar });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    boton('Exportar Excel').click();

    http.expectOne(`${api}/meetups/5/participantes/exportar`).flush(new Blob(['x']));
    expect(crear).toHaveBeenCalled();
    expect(clic).toHaveBeenCalled();
    expect(revocar).toHaveBeenCalledWith('blob:prueba');
  });

  it('muestra el error del servidor si exportar no está permitido', () => {
    boton('Exportar Excel').click();

    http
      .expectOne(`${api}/meetups/5/participantes/exportar`)
      .flush(new Blob([JSON.stringify({ mensaje: 'x' })]), { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();

    expect(raiz.querySelector('[role="alert"]')).not.toBeNull();
  });
});
