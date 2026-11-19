import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeDe } from '../../core/errores';
import { Meetup, Participante } from '../../core/models';
import { MeetupService } from '../../core/meetup.service';
import { iniciales, nombreCompleto } from '../../shared/formato';
import { MeetupCard } from '../../shared/meetup-card';
import { MeetupFormulario } from '../../shared/meetup-formulario';

type Pestana = 'organizo' | 'participo';

@Component({
  selector: 'app-mis-meetups',
  imports: [MeetupCard, MeetupFormulario],
  templateUrl: './mis-meetups.html',
})
export class MisMeetups implements OnInit {
  private readonly api = inject(MeetupService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly pestana = signal<Pestana>('organizo');
  protected readonly organizados = signal<Meetup[]>([]);
  protected readonly participando = signal<Meetup[]>([]);
  protected readonly participantes = signal<Participante[]>([]);
  protected readonly abierto = signal<number | null>(null);
  protected readonly formulario = signal<{ meetup: Meetup | null } | null>(null);
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly nombre = nombreCompleto;
  protected readonly inicialesDe = iniciales;

  ngOnInit(): void {
    this.cargar();
    if (this.ruta.snapshot.queryParamMap.get('crear')) {
      this.formulario.set({ meetup: null });
    }
  }

  protected elegirPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
    this.error.set(null);
  }

  protected abrirFormulario(meetup: Meetup | null): void {
    this.formulario.set({ meetup });
  }

  protected cerrarFormulario(): void {
    this.formulario.set(null);
    if (this.ruta.snapshot.queryParamMap.get('crear')) {
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
  }

  protected guardado(): void {
    this.cerrarFormulario();
    this.cargar();
  }

  protected cancelar(meetup: Meetup): void {
    this.accion(this.api.cancelar(meetup.id), () => this.cargar());
  }

  protected retirar(meetup: Meetup): void {
    this.accion(this.api.retirar(meetup.id), () => this.cargar());
  }

  protected alternarParticipantes(meetup: Meetup): void {
    if (this.abierto() === meetup.id) {
      this.abierto.set(null);
      return;
    }
    this.abierto.set(meetup.id);
    this.participantes.set([]);
    this.cargarParticipantes(meetup.id);
  }

  protected aprobar(participante: Participante, meetup: Meetup): void {
    this.accion(this.api.aprobar(participante.participacionId), () => {
      this.cargarParticipantes(meetup.id);
      this.cargar();
    });
  }

  protected rechazar(participante: Participante, meetup: Meetup): void {
    this.accion(this.api.rechazar(participante.participacionId), () => this.cargarParticipantes(meetup.id));
  }

  protected exportar(meetup: Meetup): void {
    this.api.exportar(meetup.id).subscribe({
      next: (blob) => descargar(blob, `participantes-meetup-${meetup.id}.xlsx`),
      error: (e) => this.error.set(mensajeDe(e)),
    });
  }

  protected etiqueta(estado: Participante['estado']): string {
    const etiquetas: Record<Participante['estado'], string> = {
      SOLICITADA: 'Pendiente',
      CONFIRMADA: 'Confirmado',
      RECHAZADA: 'Rechazado',
      RETIRADA: 'Se retiró',
    };
    return etiquetas[estado];
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.organizados().subscribe({
      next: (lista) => {
        this.organizados.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(mensajeDe(e));
      },
    });
    this.api.participando().subscribe({
      next: (lista) => this.participando.set(lista),
      error: (e) => this.error.set(mensajeDe(e)),
    });
  }

  private cargarParticipantes(meetupId: number): void {
    this.api.participantes(meetupId).subscribe({
      next: (lista) => this.participantes.set(lista),
      error: (e) => this.error.set(mensajeDe(e)),
    });
  }

  private accion(
    peticion: { subscribe: (observador: { next: () => void; error: (e: unknown) => void }) => unknown },
    alTerminar: () => void,
  ): void {
    this.ocupado.set(true);
    this.error.set(null);
    peticion.subscribe({
      next: () => {
        this.ocupado.set(false);
        alTerminar();
      },
      error: (e) => {
        this.ocupado.set(false);
        this.error.set(mensajeDe(e));
      },
    });
  }
}

export function descargar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
