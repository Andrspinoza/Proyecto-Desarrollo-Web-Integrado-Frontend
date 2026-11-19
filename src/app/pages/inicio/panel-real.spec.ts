import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PanelReal } from './panel-real';

describe('Panel conectado a la API', () => {
  it('muestra meetups y solicitudes reales y permite aceptarlas', async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({ imports: [PanelReal], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PanelReal);
    fixture.detectChanges();
    http.expectOne('/api/v1/meetups').flush([{ id: 1, title: 'Estudio de Java', type: 'ACADEMIC', status: 'SCHEDULED', scheduledAt: '2026-11-22T14:00:00Z', availableSpots: 3 }]);
    http.expectOne('/api/v1/connections/received').flush([{ id: 8, requesterId: 7, status: 'PENDING' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Estudio de Java');
    expect(fixture.nativeElement.textContent).toContain('Estudiante #7');
    const aceptar = [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLButtonElement) => button.textContent?.includes('Aceptar')) as HTMLButtonElement;
    aceptar.click();
    const respuesta = http.expectOne('/api/v1/connections/8/accept');
    expect(respuesta.request.method).toBe('PATCH');
    respuesta.flush({});
    http.expectOne('/api/v1/connections/received').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No tienes solicitudes pendientes');
    http.verify();
  });
});
