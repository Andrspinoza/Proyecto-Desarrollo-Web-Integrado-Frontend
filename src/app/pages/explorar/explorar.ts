import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ConexionService } from '../../core/conexion.service';
import { mensajeDe } from '../../core/errores';
import { ItemCatalogo, Meetup, Perfil, TipoMeetup, Universidad } from '../../core/models';
import { MeetupService } from '../../core/meetup.service';
import { PerfilService } from '../../core/perfil.service';
import { iniciales, nombreCompleto } from '../../shared/formato';
import { MeetupCard } from '../../shared/meetup-card';

type Pestana = 'meetups' | 'estudiantes';

@Component({
  selector: 'app-explorar',
  imports: [ReactiveFormsModule, MeetupCard],
  templateUrl: './explorar.html',
})
export class Explorar implements OnInit {
  private readonly meetupsApi = inject(MeetupService);
  private readonly perfilesApi = inject(PerfilService);
  private readonly conexionesApi = inject(ConexionService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly pestana = signal<Pestana>('meetups');
  protected readonly universidades = signal<Universidad[]>([]);
  protected readonly intereses = signal<ItemCatalogo[]>([]);
  protected readonly habilidades = signal<ItemCatalogo[]>([]);
  protected readonly meetups = signal<Meetup[]>([]);
  protected readonly estudiantes = signal<Perfil[]>([]);
  protected readonly enviadasA = signal<number[]>([]);
  protected readonly abierto = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ciclos = Array.from({ length: 12 }, (_, i) => i + 1);
  protected readonly nombre = nombreCompleto;
  protected readonly inicialesDe = iniciales;

  protected readonly filtroMeetups = this.fb.group({
    texto: [''],
    tipo: ['' as TipoMeetup | ''],
    universidadId: [0],
  });

  protected readonly filtroEstudiantes = this.fb.group({
    carrera: [''],
    ciclo: [0],
    universidadId: [0],
    interesId: [0],
    habilidadId: [0],
  });

  ngOnInit(): void {
    this.auth.universidades().subscribe({ next: (l) => this.universidades.set(l), error: (e) => this.fallo(e) });
    this.perfilesApi.intereses().subscribe({ next: (l) => this.intereses.set(l), error: (e) => this.fallo(e) });
    this.perfilesApi.habilidades().subscribe({ next: (l) => this.habilidades.set(l), error: (e) => this.fallo(e) });
    this.buscarMeetups();
  }

  protected elegirPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
    this.error.set(null);
    if (pestana === 'meetups') {
      this.buscarMeetups();
    } else {
      this.buscarEstudiantes();
    }
  }

  protected buscarMeetups(): void {
    const { texto, tipo, universidadId } = this.filtroMeetups.getRawValue();
    this.cargando.set(true);
    this.meetupsApi
      .listar({
        texto: texto.trim() || undefined,
        tipo: tipo || undefined,
        universidadId: universidadId || undefined,
      })
      .subscribe({
        next: (lista) => {
          this.meetups.set(lista);
          this.cargando.set(false);
        },
        error: (e) => {
          this.cargando.set(false);
          this.fallo(e);
        },
      });
  }

  protected buscarEstudiantes(): void {
    const { carrera, ciclo, universidadId, interesId, habilidadId } = this.filtroEstudiantes.getRawValue();
    this.cargando.set(true);
    this.perfilesApi
      .buscar({
        carrera: carrera.trim() || undefined,
        ciclo: ciclo || undefined,
        universidadId: universidadId || undefined,
        interesId: interesId || undefined,
        habilidadId: habilidadId || undefined,
      })
      .subscribe({
        next: (lista) => {
          this.estudiantes.set(lista);
          this.cargando.set(false);
        },
        error: (e) => {
          this.cargando.set(false);
          this.fallo(e);
        },
      });
  }

  protected solicitar(meetup: Meetup): void {
    this.accion(this.meetupsApi.solicitar(meetup.id), () => this.buscarMeetups());
  }

  protected retirar(meetup: Meetup): void {
    this.accion(this.meetupsApi.retirar(meetup.id), () => this.buscarMeetups());
  }

  protected conectar(persona: Perfil): void {
    this.accion(this.conexionesApi.solicitar(persona.estudianteId), () =>
      this.enviadasA.update((ids) => [...ids, persona.estudianteId]),
    );
  }

  protected yaEnviada(persona: Perfil): boolean {
    return this.enviadasA().includes(persona.estudianteId);
  }

  protected alternarDetalle(persona: Perfil): void {
    this.abierto.set(this.abierto() === persona.estudianteId ? null : persona.estudianteId);
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
        this.fallo(e);
      },
    });
  }

  private fallo(error: unknown): void {
    this.error.set(mensajeDe(error));
  }
}
