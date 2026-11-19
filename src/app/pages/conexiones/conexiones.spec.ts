import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth.service';
import { ConexionesReales } from './conexiones';

describe('ConexionesReales', () => {
  it('busca estudiantes y envía la solicitud seleccionada', async () => {
    await TestBed.configureTestingModule({
      imports: [ConexionesReales],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AuthService, useValue: { usuario: () => ({ estudianteId: 1 }) } }],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ConexionesReales);
    fixture.detectChanges();
    http.expectOne('/api/v1/connections/received').flush([]);
    const buscar = [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLButtonElement) => b.textContent?.trim() === 'Buscar') as HTMLButtonElement;
    buscar.click();
    http.expectOne((request) => request.url === '/api/v1/students/discover' && request.method === 'GET').flush([{id: 2, firstName: 'Ana', lastName: 'Quispe'}]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana Quispe');
    const enviar = [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLButtonElement) => b.closest('section')?.textContent?.includes('Ana Quispe') && b.textContent?.trim() === 'Enviar solicitud') as HTMLButtonElement;
    enviar.click();
    const solicitud = http.expectOne('/api/v1/connections');
    expect(solicitud.request.body).toEqual({recipientId: 2});
    solicitud.flush({});
    http.expectOne('/api/v1/connections/sent').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Solicitud enviada.');
    http.verify();
  });

  it('muestra una solicitud recibida y permite aceptarla', async () => {
    await TestBed.configureTestingModule({
      imports: [ConexionesReales],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AuthService, useValue: { usuario: () => ({ estudianteId: 1 }) } }],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ConexionesReales);
    fixture.detectChanges();
    http.expectOne('/api/v1/connections/received').flush([{ id: 5, requesterId: 2, recipientId: 1, status: 'PENDING', createdAt: '2026-11-19T12:00:00Z' }]);
    http.expectOne('/api/v1/students/2').flush({ firstName: 'Ana', lastName: 'Quispe' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana Quispe');
    const aceptar = [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLButtonElement) => b.textContent?.includes('Aceptar')) as HTMLButtonElement;
    aceptar.click();
    const peticion = http.expectOne('/api/v1/connections/5/accept');
    expect(peticion.request.method).toBe('PATCH');
    peticion.flush({});
    http.expectOne('/api/v1/connections/received').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('¡Qué sale! Ya conectaron');
    expect(fixture.nativeElement.textContent).toContain('No tienes solicitudes pendientes');
    http.verify();
  });

  it('muestra conexión aceptada sin inventar nombre si el perfil no está disponible', async () => {
    await TestBed.configureTestingModule({
      imports: [ConexionesReales],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AuthService, useValue: { usuario: () => ({ estudianteId: 1 }) } }],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ConexionesReales);
    fixture.detectChanges();
    http.expectOne('/api/v1/connections/received').flush([]);
    const boton = [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLButtonElement) => b.textContent?.trim() === 'Conexiones') as HTMLButtonElement;
    boton.click(); fixture.detectChanges();
    http.expectOne('/api/v1/connections?status=ACCEPTED').flush([{ id: 6, requesterId: 1, recipientId: 3, status: 'ACCEPTED', createdAt: '2026-11-19T12:00:00Z' }]);
    http.expectOne('/api/v1/students/3').flush({}, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Estudiante #3');
    http.verify();
  });
});
