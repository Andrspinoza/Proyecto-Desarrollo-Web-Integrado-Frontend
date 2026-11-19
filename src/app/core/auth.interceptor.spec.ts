import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let cliente: HttpClient;
  let http: HttpTestingController;
  let auth: AuthService;

  function preparar(token: string | null): void {
    sessionStorage.clear();
    if (token !== null) {
      sessionStorage.setItem('quesale.token', token);
    }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    cliente = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  }

  afterEach(() => http.verify());

  it('agrega el token a las peticiones de la API', () => {
    preparar('abc');

    cliente.get(`${environment.apiUrl}/meetups`).subscribe();

    const peticion = http.expectOne(`${environment.apiUrl}/meetups`);
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer abc');
    peticion.flush([]);
  });

  it('no envía el token a otras direcciones', () => {
    preparar('abc');

    cliente.get('https://otro.example/datos').subscribe();

    const peticion = http.expectOne('https://otro.example/datos');
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });

  it('no agrega encabezado cuando no hay sesión', () => {
    preparar(null);

    cliente.get(`${environment.apiUrl}/universidades`).subscribe();

    const peticion = http.expectOne(`${environment.apiUrl}/universidades`);
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush([]);
  });

  it('cierra la sesión cuando la API responde 401 en una ruta protegida', () => {
    preparar('abc');
    const cerrar = vi.spyOn(auth, 'cerrarSesion').mockImplementation(() => undefined);

    cliente.get(`${environment.apiUrl}/meetups`).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiUrl}/meetups`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(cerrar).toHaveBeenCalled();
  });

  it('no cierra la sesión por un 401 del inicio de sesión', () => {
    preparar(null);
    const cerrar = vi.spyOn(auth, 'cerrarSesion').mockImplementation(() => undefined);

    cliente.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(cerrar).not.toHaveBeenCalled();
  });
});
