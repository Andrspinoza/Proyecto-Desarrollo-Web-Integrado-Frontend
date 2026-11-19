import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meetup } from '../core/models';
import { MeetupCard } from './meetup-card';

function meetup(cambios: Partial<Meetup> = {}): Meetup {
  return {
    id: 5,
    titulo: 'Repaso de Base de Datos II',
    descripcion: 'Antes del parcial',
    tipo: 'ACADEMICO',
    fechaHora: '2026-10-28T18:00:00',
    lugar: 'Biblioteca',
    cupoMaximo: 4,
    confirmados: 1,
    estado: 'PROGRAMADO',
    organizadorId: 2,
    organizador: 'Luis Alanya',
    universidad: 'UTP',
    esOrganizador: false,
    miParticipacion: null,
    ...cambios,
  };
}

describe('MeetupCard', () => {
  let fixture: ComponentFixture<MeetupCard>;

  function mostrar(cambios: Partial<Meetup> = {}): HTMLElement {
    fixture = TestBed.createComponent(MeetupCard);
    fixture.componentRef.setInput('meetup', meetup(cambios));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MeetupCard] }).compileComponents();
  });

  it('muestra el título, el lugar, el cupo y el organizador', () => {
    const texto = mostrar().textContent ?? '';

    expect(texto).toContain('Repaso de Base de Datos II');
    expect(texto).toContain('Biblioteca');
    expect(texto).toContain('1 / 4 confirmados');
    expect(texto).toContain('Organiza Luis Alanya');
  });

  it('identifica el tipo del meetup', () => {
    expect(mostrar().textContent).toContain('Académico');
    expect(mostrar({ tipo: 'SOCIAL' }).textContent).toContain('Social');
  });

  it('ofrece solicitar cuando hay cupo y emite el meetup', () => {
    const raiz = mostrar();
    const emitidos: Meetup[] = [];
    fixture.componentInstance.solicitar.subscribe((m) => emitidos.push(m));

    (raiz.querySelector('button') as HTMLButtonElement).click();

    expect(raiz.textContent).toContain('Solicitar unirme');
    expect(emitidos).toHaveLength(1);
    expect(emitidos[0].id).toBe(5);
  });

  it('indica cupo lleno sin ofrecer solicitar', () => {
    const raiz = mostrar({ confirmados: 4 });

    expect(raiz.textContent).toContain('Cupo lleno');
    expect(raiz.querySelector('button')).toBeNull();
  });

  it('permite cancelar una solicitud enviada', () => {
    const raiz = mostrar({ miParticipacion: 'SOLICITADA' });
    const emitidos: Meetup[] = [];
    fixture.componentInstance.retirar.subscribe((m) => emitidos.push(m));

    (raiz.querySelector('button') as HTMLButtonElement).click();

    expect(raiz.textContent).toContain('Solicitud enviada');
    expect(emitidos).toHaveLength(1);
  });

  it('permite retirarse cuando ya está confirmado', () => {
    expect(mostrar({ miParticipacion: 'CONFIRMADA' }).textContent).toContain('Confirmado · Retirarme');
  });

  it('muestra que el usuario es el organizador y no ofrece solicitar', () => {
    const raiz = mostrar({ esOrganizador: true });

    expect(raiz.textContent).toContain('Eres el organizador');
    expect(raiz.querySelector('button')).toBeNull();
  });

  it('muestra como cancelado un meetup propio cancelado', () => {
    const texto = mostrar({ esOrganizador: true, estado: 'CANCELADO' }).textContent ?? '';

    expect(texto).toContain('Cancelado');
    expect(texto).not.toContain('Eres el organizador');
  });

  it('muestra los meetups cancelados y las solicitudes rechazadas', () => {
    expect(mostrar({ estado: 'CANCELADO' }).textContent).toContain('Cancelado');
    expect(mostrar({ miParticipacion: 'RECHAZADA' }).textContent).toContain('Solicitud rechazada');
  });
});
