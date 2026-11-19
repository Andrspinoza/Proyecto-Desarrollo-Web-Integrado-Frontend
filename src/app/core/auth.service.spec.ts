import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { AuthRespuesta } from './models';

const respuesta: AuthRespuesta = {
  token: 'token-de-prueba',
  tipo: 'Bearer',
  expiraEnSegundos: 7200,
  usuario: {
    estudianteId: 1,
    correo: 'ana@utp.edu.pe',
    nombres: 'Ana',
    apellidos: 'Quispe',
    universidadId: 1,
    universidad: 'UTP',
    rol: 'ESTUDIANTE',
  },
};
const sesion = { accessToken: 'token-de-prueba', tokenType: 'Bearer', expiresIn: 7200, studentId: 1 };
const estudiante = { id: 1, email: 'ana@utp.edu.pe', firstName: 'Ana', lastName: 'Quispe', universityId: 1 };
const universidades = [{ id: 1, name: 'UTP', emailDomain: 'utp.edu.pe', active: true }];

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('empieza sin sesión', () => {
    expect(auth.autenticado()).toBe(false);
    expect(auth.usuario()).toBeNull();
  });

  it('inicia sesión y guarda el token y el usuario', () => {
    auth.iniciarSesion({ correo: 'ana@utp.edu.pe', password: 'Clave1234' }).subscribe();

    const peticion = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(peticion.request.method).toBe('POST');
    peticion.flush(sesion);
    http.expectOne(`${environment.apiUrl}/students/1`).flush(estudiante);
    http.expectOne(`${environment.apiUrl}/universities`).flush(universidades);

    expect(auth.autenticado()).toBe(true);
    expect(auth.token()).toBe('token-de-prueba');
    expect(auth.usuario()?.nombres).toBe('Ana');
    expect(sessionStorage.getItem('quesale.token')).toBe('token-de-prueba');
  });

  it('registra sin iniciar sesión antes de verificar el correo', () => {
    auth
      .registrar({
        correo: 'ana@utp.edu.pe',
        password: 'Clave1234',
        nombres: 'Ana',
        apellidos: 'Quispe',
        universidadId: 1,
      })
      .subscribe();

    http.expectOne(`${environment.apiUrl}/auth/register`).flush({ studentId: 1, message: 'Verifica tu correo' });

    expect(auth.autenticado()).toBe(false);
  });

  it('cierra la sesión, limpia el almacenamiento y vuelve al acceso', () => {
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    auth.iniciarSesion({ correo: 'ana@utp.edu.pe', password: 'Clave1234' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(sesion);
    http.expectOne(`${environment.apiUrl}/students/1`).flush(estudiante);
    http.expectOne(`${environment.apiUrl}/universities`).flush(universidades);

    auth.cerrarSesion();

    expect(auth.autenticado()).toBe(false);
    expect(auth.usuario()).toBeNull();
    expect(sessionStorage.getItem('quesale.token')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/acceso']);
  });

  it('no inicia sesión si el servidor rechaza las credenciales', () => {
    let fallo = false;
    auth.iniciarSesion({ correo: 'ana@utp.edu.pe', password: 'mala' }).subscribe({ error: () => (fallo = true) });

    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ mensaje: 'Credenciales invalidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(fallo).toBe(true);
    expect(auth.autenticado()).toBe(false);
  });
});
