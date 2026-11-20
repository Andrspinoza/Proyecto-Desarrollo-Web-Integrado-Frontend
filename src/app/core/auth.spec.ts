import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { mensajeDeError } from './errores';
import { authGuard, invitadoGuard, perfilGuard } from './guards';

function ejecutar(guarda: typeof authGuard): unknown {
  return TestBed.runInInjectionContext(() => guarda({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
}

function preparar(token: string | null): void {
  sessionStorage.clear();
  if (token !== null) sessionStorage.setItem('quesale.token', token);
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
  });
}

describe('guardas', () => {
  it('authGuard deja pasar a quien tiene sesión', () => {
    preparar('abc');
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('authGuard envía al acceso a quien no tiene sesión', () => {
    preparar(null);
    const resultado = ejecutar(authGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/acceso');
  });

  it('invitadoGuard envía a descubrir a quien ya tiene sesión', () => {
    preparar('abc');
    const resultado = ejecutar(invitadoGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/descubrir');
  });

  it('invitadoGuard deja pasar a quien no tiene sesión', () => {
    preparar(null);
    expect(ejecutar(invitadoGuard)).toBe(true);
  });

  it('perfilGuard envía a la bienvenida a quien aún no tiene perfil', () => {
    preparar('abc');
    const http = TestBed.inject(HttpTestingController);
    let resultado: unknown;
    (ejecutar(perfilGuard) as { subscribe: (f: (v: unknown) => void) => void }).subscribe((v) => (resultado = v));

    http.expectOne('/api/v1/students/me').flush({ id: 1, firstName: 'Luis', lastName: 'A', profile: null });

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/bienvenida');
  });

  it('perfilGuard deja pasar a quien ya completó su perfil', () => {
    preparar('abc');
    const http = TestBed.inject(HttpTestingController);
    let resultado: unknown;
    (ejecutar(perfilGuard) as { subscribe: (f: (v: unknown) => void) => void }).subscribe((v) => (resultado = v));

    http.expectOne('/api/v1/students/me').flush({ id: 1, firstName: 'Luis', lastName: 'A', profile: { career: 'x', cycle: 1 } });

    expect(resultado).toBe(true);
  });
});

describe('AuthService e interceptor', () => {
  it('al iniciar sesión guarda el token y carga mi estudiante', () => {
    preparar(null);
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);

    auth.iniciarSesion('luis@utp.edu.pe', 'Clave-1234').subscribe();
    http.expectOne('/api/v1/auth/login').flush({ accessToken: 'tok', tokenType: 'Bearer', expiresIn: 3600, studentId: 1 });
    const yo = http.expectOne('/api/v1/students/me');
    expect(yo.request.headers.get('Authorization')).toBe('Bearer tok');
    yo.flush({ id: 1, firstName: 'Luis', lastName: 'Alanya', universityId: 1, profile: null });

    expect(auth.autenticado()).toBe(true);
    expect(auth.token()).toBe('tok');
    expect(auth.nombre()).toBe('Luis');
    expect(auth.perfilCompleto()).toBe(false);
    expect(sessionStorage.getItem('quesale.token')).toBe('tok');
  });

  it('cerrar sesión borra todo', () => {
    preparar('abc');
    const auth = TestBed.inject(AuthService);

    auth.cerrarSesion();

    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem('quesale.token')).toBeNull();
  });

  it('un 401 fuera de la autenticación cierra la sesión', () => {
    preparar('abc');
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);

    auth.cargarYo().subscribe({ error: () => undefined });
    http.expectOne('/api/v1/students/me').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.autenticado()).toBe(false);
  });

  it('un 401 al iniciar sesión no cierra nada: es una clave incorrecta', () => {
    preparar(null);
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    let estado = 0;

    auth.iniciarSesion('a@utp.edu.pe', 'mala').subscribe({ error: (e: HttpErrorResponse) => (estado = e.status) });
    http.expectOne('/api/v1/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(estado).toBe(401);
  });
});

describe('mensajes de error', () => {
  const error = (status: number, message?: string) => new HttpErrorResponse({ status, error: message ? { message } : null });

  it('traduce los códigos comunes', () => {
    expect(mensajeDeError(error(0))).toContain('conexión');
    expect(mensajeDeError(error(429))).toContain('Demasiados intentos');
    expect(mensajeDeError(error(413))).toContain('grande');
    expect(mensajeDeError(error(404))).toContain('No se encontró');
  });

  it('usa el mensaje del servidor cuando lo hay', () => {
    expect(mensajeDeError(error(409, 'Ya existe'))).toBe('Ya existe');
    expect(mensajeDeError(error(400, 'Fecha inválida'))).toBe('Fecha inválida');
  });

  it('usa el texto por defecto con errores desconocidos', () => {
    expect(mensajeDeError(new Error('x'), 'Fallo')).toBe('Fallo');
    expect(mensajeDeError(error(500), 'Fallo')).toBe('Fallo');
  });
});
