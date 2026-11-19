import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

describe('Shell', () => {
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
      imports: [Shell],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('muestra únicamente la navegación conectada a la API', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    const textos = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('nav a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(textos).toEqual(['Inicio', 'Conexiones']);
  });

  it('muestra el nombre, la universidad y las iniciales del usuario', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ana Quispe');
    expect(texto).toContain('UTP');
    expect(texto).toContain('AQ');
  });
});
