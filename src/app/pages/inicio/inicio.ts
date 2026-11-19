import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ConexionService } from '../../core/conexion.service';
import { mensajeDe } from '../../core/errores';
import { Conexion, Meetup, Perfil, TipoMeetup } from '../../core/models';
import { MeetupService } from '../../core/meetup.service';
import { PerfilService } from '../../core/perfil.service';
import { iniciales, nombreCompleto } from '../../shared/formato';
import { MeetupCard } from '../../shared/meetup-card';

type Filtro = 'TODOS' | TipoMeetup;

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MeetupCard],
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  private readonly meetupsApi = inject(MeetupService);
  private readonly conexionesApi = inject(ConexionService);
  private readonly perfilesApi = inject(PerfilService);
  protected readonly usuario = inject(AuthService).usuario;

  protected readonly filtro = signal<Filtro>('TODOS');
  protected readonly meetups = signal<Meetup[]>([]);
  protected readonly recibidas = signal<Conexion[]>([]);
  protected readonly sugeridos = signal<Perfil[]>([]);
  protected readonly enviadasA = signal<number[]>([]);
  protected readonly contactosIds = signal<number[]>([]);
  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly organizados = signal(0);
  protected readonly participando = signal(0);
  protected readonly contactos = signal(0);
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtros: { valor: Filtro; texto: string }[] = [
    { valor: 'TODOS', texto: 'Todos' },
    { valor: 'ACADEMICO', texto: 'Académico' },
    { valor: 'SOCIAL', texto: 'Social' },
  ];
  protected readonly sugerencias = computed(() =>
    this.sugeridos()
      .filter((p) => !this.contactosIds().includes(p.estudianteId))
      .slice(0, 3),
  );
  protected readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? iniciales(u) : '';
  });
  protected readonly nombre = nombreCompleto;
  protected readonly inicialesDe = iniciales;

  ngOnInit(): void {
    this.cargarMeetups();
    this.perfilesApi.miPerfil().subscribe({ next: (p) => this.perfil.set(p), error: (e) => this.fallo(e) });
    this.meetupsApi.organizados().subscribe({
      next: (lista) => this.organizados.set(lista.filter((m) => m.estado === 'PROGRAMADO').length),
      error: (e) => this.fallo(e),
    });
    this.meetupsApi.participando().subscribe({
      next: (lista) => this.participando.set(lista.length),
      error: (e) => this.fallo(e),
    });
    this.conexionesApi.contactos().subscribe({
      next: (l) => {
        this.contactos.set(l.length);
        this.contactosIds.set(l.map((c) => c.estudianteId));
      },
      error: (e) => this.fallo(e),
    });
    this.conexionesApi.recibidas().subscribe({ next: (l) => this.recibidas.set(l), error: (e) => this.fallo(e) });
    this.perfilesApi.buscar({}).subscribe({
      next: (lista) => this.sugeridos.set(lista),
      error: (e) => this.fallo(e),
    });
  }

  protected elegirFiltro(filtro: Filtro): void {
    this.filtro.set(filtro);
    this.cargarMeetups();
  }

  protected solicitar(meetup: Meetup): void {
    this.ejecutar(this.meetupsApi.solicitar(meetup.id), () => this.cargarMeetups());
  }

  protected retirar(meetup: Meetup): void {
    this.ejecutar(this.meetupsApi.retirar(meetup.id), () => this.cargarMeetups());
  }

  protected aceptar(conexion: Conexion): void {
    this.ejecutar(this.conexionesApi.aceptar(conexion.id), () => {
      this.quitarSolicitud(conexion);
      this.contactos.update((n) => n + 1);
      this.contactosIds.update((ids) => [...ids, conexion.estudianteId]);
    });
  }

  protected rechazar(conexion: Conexion): void {
    this.ejecutar(this.conexionesApi.rechazar(conexion.id), () => this.quitarSolicitud(conexion));
  }

  protected conectar(persona: Perfil): void {
    this.ejecutar(this.conexionesApi.solicitar(persona.estudianteId), () =>
      this.enviadasA.update((ids) => [...ids, persona.estudianteId]),
    );
  }

  protected yaEnviada(persona: Perfil): boolean {
    return this.enviadasA().includes(persona.estudianteId);
  }

  private quitarSolicitud(conexion: Conexion): void {
    this.recibidas.update((lista) => lista.filter((c) => c.id !== conexion.id));
  }

  private cargarMeetups(): void {
    this.cargando.set(true);
    const tipo = this.filtro() === 'TODOS' ? undefined : (this.filtro() as TipoMeetup);
    this.meetupsApi.listar({ tipo }).subscribe({
      next: (lista) => {
        this.meetups.set(lista.slice(0, 6));
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.fallo(e);
      },
    });
  }

  private ejecutar(
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
