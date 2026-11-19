import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Meetup } from '../core/models';
import { MeetupFormulario } from './meetup-formulario';

const api = environment.apiUrl;

const existente: Meetup = {
  id: 7,
  titulo: 'Repaso',
  descripcion: 'Antes del parcial',
  tipo: 'ACADEMICO',
  fechaHora: '2026-10-28T18:00:00',
  lugar: 'Biblioteca',
  cupoMaximo: 6,
  confirmados: 0,
  estado: 'PROGRAMADO',
  organizadorId: 1,
  organizador: 'Ana Quispe',
  universidad: 'UTP',
  esOrganizador: true,
  miParticipacion: null,
};

describe('MeetupFormulario', () => {
  let fixture: ComponentFixture<MeetupFormulario>;
  let http: HttpTestingController;
  let raiz: HTMLElement;

  function abrir(meetup: Meetup | null): void {
    fixture = TestBed.createComponent(MeetupFormulario);
    fixture.componentRef.setInput('meetup', meetup);
    fixture.detectChanges();
    raiz = fixture.nativeElement as HTMLElement;
  }

  function escribir(selector: string, valor: string): void {
    const campo = raiz.querySelector(selector) as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  function enviar(): void {
    (raiz.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetupFormulario],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('no envía un meetup incompleto y marca los campos obligatorios', () => {
    abrir(null);

    enviar();

    http.expectNone(`${api}/meetups`);
    expect(raiz.textContent).toContain('Escribe un título');
    expect(raiz.textContent).toContain('Elige la fecha y la hora');
  });

  it('crea un meetup con los datos del formulario', () => {
    abrir(null);
    const guardados: Meetup[] = [];
    fixture.componentInstance.guardado.subscribe((m) => guardados.push(m));
    escribir('#titulo', '  Pichanga ');
    escribir('#fecha', '2026-11-02T17:30');
    escribir('#lugar', 'Cancha 2');
    escribir('#cupo', '12');

    enviar();

    const peticion = http.expectOne(`${api}/meetups`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({
      titulo: 'Pichanga',
      descripcion: null,
      tipo: 'ACADEMICO',
      fechaHora: '2026-11-02T17:30',
      lugar: 'Cancha 2',
      cupoMaximo: 12,
    });
    peticion.flush(existente);
    expect(guardados).toHaveLength(1);
  });

  it('rechaza un cupo fuera de rango', () => {
    abrir(null);
    escribir('#titulo', 'Pichanga');
    escribir('#fecha', '2026-11-02T17:30');
    escribir('#lugar', 'Cancha');
    escribir('#cupo', '80');

    enviar();

    http.expectNone(`${api}/meetups`);
    expect(raiz.textContent).toContain('El cupo debe estar entre 2 y 50');
  });

  it('carga los datos de un meetup existente y lo actualiza con PUT', () => {
    abrir(existente);

    expect((raiz.querySelector('#titulo') as HTMLInputElement).value).toBe('Repaso');
    expect((raiz.querySelector('#fecha') as HTMLInputElement).value).toBe('2026-10-28T18:00');
    escribir('#cupo', '8');
    enviar();

    const peticion = http.expectOne(`${api}/meetups/7`);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body.cupoMaximo).toBe(8);
    peticion.flush({ ...existente, cupoMaximo: 8 });
  });

  it('muestra el error del servidor, por ejemplo una fecha pasada', () => {
    abrir(null);
    escribir('#titulo', 'Pichanga');
    escribir('#fecha', '2020-01-01T10:00');
    escribir('#lugar', 'Cancha');
    enviar();

    http
      .expectOne(`${api}/meetups`)
      .flush({ mensaje: 'La fecha del meetup debe ser futura', detalles: [] }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('debe ser futura');
  });

  it('avisa al cerrar con el botón Cancelar', () => {
    abrir(null);
    let cerrado = false;
    fixture.componentInstance.cerrado.subscribe(() => (cerrado = true));

    (Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Cancelar') as HTMLButtonElement).click();

    expect(cerrado).toBe(true);
  });
});
