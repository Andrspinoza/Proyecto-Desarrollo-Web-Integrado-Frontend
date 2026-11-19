import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Acceso, PATRON_PASSWORD } from './acceso';

const universidades = [
  { id: 1, name: 'Universidad Tecnologica del Peru (UTP)', emailDomain: 'utp.edu.pe', active: true },
  { id: 2, name: 'Universidad Peruana de Ciencias Aplicadas (UPC)', emailDomain: 'upc.edu.pe', active: true },
];

const respuestaAuth = {
  token: 't',
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

describe('Acceso', () => {
  let fixture: ComponentFixture<Acceso>;
  let http: HttpTestingController;
  let raiz: HTMLElement;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Acceso],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Acceso);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/universities`).flush(universidades);
    fixture.detectChanges();
    raiz = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  function escribir(selector: string, valor: string): void {
    const entrada = raiz.querySelector(selector) as HTMLInputElement;
    entrada.value = valor;
    entrada.dispatchEvent(new Event('input'));
  }

  function pulsarEnviar(): void {
    (raiz.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function pestana(texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll('button[role="tab"]')).find((b) =>
      b.textContent?.includes(texto),
    ) as HTMLButtonElement;
  }

  it('muestra las universidades de la red', () => {
    expect(raiz.textContent).toContain('utp.edu.pe');
    expect(raiz.textContent).toContain('upc.edu.pe');
  });

  it('no envía el formulario de inicio de sesión si está vacío', () => {
    pulsarEnviar();

    http.expectNone(`${environment.apiUrl}/auth/login`);
    expect(raiz.textContent).toContain('Ingresa un correo válido');
  });

  it('inicia sesión con el correo y la contraseña y entra a la aplicación', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    escribir('#correo', 'ana@utp.edu.pe');
    escribir('#password', 'Clave1234');

    pulsarEnviar();

    const peticion = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(peticion.request.body).toEqual({ email: 'ana@utp.edu.pe', password: 'Clave1234' });
    peticion.flush({ accessToken: 't', tokenType: 'Bearer', expiresIn: 7200, studentId: 1 });
    http.expectOne(`${environment.apiUrl}/students/1`).flush({ id: 1, email: 'ana@utp.edu.pe', firstName: 'Ana', lastName: 'Quispe', universityId: 1 });
    http.expectOne(`${environment.apiUrl}/universities`).flush(universidades);
    expect(navegar).toHaveBeenCalledWith(['/inicio']);
  });

  it('muestra el mensaje del servidor cuando las credenciales son inválidas', () => {
    escribir('#correo', 'ana@utp.edu.pe');
    escribir('#password', 'Mala12345');
    pulsarEnviar();

    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ mensaje: 'Credenciales invalidas', detalles: [] }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Credenciales invalidas');
  });

  it('cambia a crear cuenta y pide universidad, nombres y apellidos', () => {
    pestana('Crear cuenta').click();
    fixture.detectChanges();

    expect(raiz.querySelector('#universidad')).not.toBeNull();
    expect(raiz.querySelector('#nombres')).not.toBeNull();
    expect(raiz.querySelector('#apellidos')).not.toBeNull();
  });

  it('exige una contraseña con mayúscula y número al crear la cuenta', () => {
    pestana('Crear cuenta').click();
    fixture.detectChanges();
    escribir('#nombres', 'Ana');
    escribir('#apellidos', 'Quispe');
    escribir('#correo', 'ana@utp.edu.pe');
    escribir('#password', 'sinnumero');
    (raiz.querySelector('#universidad') as HTMLSelectElement).selectedIndex = 1;
    (raiz.querySelector('#universidad') as HTMLSelectElement).dispatchEvent(new Event('change'));

    pulsarEnviar();

    http.expectNone(`${environment.apiUrl}/auth/register`);
  });

  it('registra a un estudiante con sus datos', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    pestana('Crear cuenta').click();
    fixture.detectChanges();
    escribir('#nombres', 'Ana');
    escribir('#apellidos', 'Quispe');
    escribir('#correo', 'ana@utp.edu.pe');
    escribir('#password', 'Clave1234');
    (raiz.querySelector('#universidad') as HTMLSelectElement).selectedIndex = 1;
    (raiz.querySelector('#universidad') as HTMLSelectElement).dispatchEvent(new Event('change'));

    pulsarEnviar();

    const peticion = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(peticion.request.body).toMatchObject({ firstName: 'Ana', universityId: 1, email: 'ana@utp.edu.pe' });
    peticion.flush({ studentId: 1, message: 'Verifica tu correo' });
    fixture.detectChanges();
    expect(navegar).not.toHaveBeenCalled();
    expect(raiz.textContent).toContain('Revisa tu correo institucional');
  });

  it('alterna la visibilidad de la contraseña', () => {
    const campo = raiz.querySelector('#password') as HTMLInputElement;
    expect(campo.type).toBe('password');

    (raiz.querySelector('button[aria-label="Mostrar contraseña"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(campo.type).toBe('text');
  });
});

describe('PATRON_PASSWORD', () => {
  it('coincide con la regla del backend', () => {
    expect(PATRON_PASSWORD.test('Clave1234')).toBe(true);
    expect(PATRON_PASSWORD.test('clave1234')).toBe(false);
    expect(PATRON_PASSWORD.test('ClaveClave')).toBe(false);
    expect(PATRON_PASSWORD.test('Cl1')).toBe(false);
  });
});
