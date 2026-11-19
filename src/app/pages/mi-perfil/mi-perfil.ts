import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ConexionService } from '../../core/conexion.service';
import { mensajeDe } from '../../core/errores';
import { Conexion, ItemCatalogo, Perfil, Visibilidad } from '../../core/models';
import { PerfilService } from '../../core/perfil.service';
import { iniciales, nombreCompleto } from '../../shared/formato';

export const MAXIMO_ELEGIDOS = 10;

@Component({
  selector: 'app-mi-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  private readonly perfilesApi = inject(PerfilService);
  private readonly conexionesApi = inject(ConexionService);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly usuario = inject(AuthService).usuario;

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly intereses = signal<ItemCatalogo[]>([]);
  protected readonly habilidades = signal<ItemCatalogo[]>([]);
  protected readonly interesesElegidos = signal<number[]>([]);
  protected readonly habilidadesElegidas = signal<number[]>([]);
  protected readonly contactos = signal<Conexion[]>([]);
  protected readonly enviadas = signal<Conexion[]>([]);
  protected readonly guardando = signal(false);
  protected readonly guardado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ciclos = Array.from({ length: 12 }, (_, i) => i + 1);
  protected readonly nombre = nombreCompleto;
  protected readonly inicialesDe = iniciales;

  protected readonly formulario = this.fb.group({
    carrera: ['', [Validators.maxLength(100)]],
    ciclo: [0],
    descripcion: ['', [Validators.maxLength(500)]],
    visibilidad: ['PUBLICO' as Visibilidad],
  });

  ngOnInit(): void {
    this.perfilesApi.miPerfil().subscribe({ next: (p) => this.cargar(p), error: (e) => this.fallo(e) });
    this.perfilesApi.intereses().subscribe({ next: (l) => this.intereses.set(l), error: (e) => this.fallo(e) });
    this.perfilesApi.habilidades().subscribe({ next: (l) => this.habilidades.set(l), error: (e) => this.fallo(e) });
    this.conexionesApi.contactos().subscribe({ next: (l) => this.contactos.set(l), error: (e) => this.fallo(e) });
    this.conexionesApi.enviadas().subscribe({ next: (l) => this.enviadas.set(l), error: (e) => this.fallo(e) });
  }

  protected alternarInteres(id: number): void {
    this.interesesElegidos.update((ids) => alternar(ids, id));
    this.guardado.set(false);
  }

  protected alternarHabilidad(id: number): void {
    this.habilidadesElegidas.update((ids) => alternar(ids, id));
    this.guardado.set(false);
  }

  protected privado(): boolean {
    return this.formulario.controls.visibilidad.value === 'PRIVADO';
  }

  protected elegir(visibilidad: Visibilidad): void {
    this.formulario.controls.visibilidad.setValue(visibilidad);
    this.guardado.set(false);
  }

  protected guardar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { carrera, ciclo, descripcion, visibilidad } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.error.set(null);
    this.perfilesApi
      .actualizar({
        carrera: carrera.trim() || null,
        ciclo: ciclo > 0 ? ciclo : null,
        descripcion: descripcion.trim() || null,
        visibilidad,
        interesIds: this.interesesElegidos(),
        habilidadIds: this.habilidadesElegidas(),
      })
      .subscribe({
        next: (p) => {
          this.cargar(p);
          this.guardando.set(false);
          this.guardado.set(true);
        },
        error: (e) => {
          this.guardando.set(false);
          this.fallo(e);
        },
      });
  }

  protected cancelarSolicitud(conexion: Conexion): void {
    this.conexionesApi.cancelar(conexion.id).subscribe({
      next: () => this.enviadas.update((lista) => lista.filter((c) => c.id !== conexion.id)),
      error: (e) => this.fallo(e),
    });
  }

  protected elegido(lista: number[], id: number): boolean {
    return lista.includes(id);
  }

  private cargar(perfil: Perfil): void {
    this.perfil.set(perfil);
    this.formulario.reset({
      carrera: perfil.carrera ?? '',
      ciclo: perfil.ciclo ?? 0,
      descripcion: perfil.descripcion ?? '',
      visibilidad: perfil.visibilidad,
    });
    this.interesesElegidos.set(perfil.intereses.map((i) => i.id));
    this.habilidadesElegidas.set(perfil.habilidades.map((h) => h.id));
  }

  private fallo(error: unknown): void {
    this.error.set(mensajeDe(error));
  }
}

export function alternar(ids: number[], id: number): number[] {
  if (ids.includes(id)) {
    return ids.filter((x) => x !== id);
  }
  return ids.length >= MAXIMO_ELEGIDOS ? ids : [...ids, id];
}
