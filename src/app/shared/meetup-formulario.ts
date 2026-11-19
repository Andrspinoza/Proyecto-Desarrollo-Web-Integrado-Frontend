import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensajeDe } from '../core/errores';
import { Meetup, TipoMeetup } from '../core/models';
import { MeetupService } from '../core/meetup.service';

@Component({
  selector: 'app-meetup-formulario',
  imports: [ReactiveFormsModule],
  templateUrl: './meetup-formulario.html',
})
export class MeetupFormulario implements OnInit {
  private readonly api = inject(MeetupService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly meetup = input<Meetup | null>(null);
  readonly guardado = output<Meetup>();
  readonly cerrado = output<void>();

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    tipo: ['ACADEMICO' as TipoMeetup, [Validators.required]],
    fechaHora: ['', [Validators.required]],
    lugar: ['', [Validators.required, Validators.maxLength(150)]],
    cupoMaximo: [10, [Validators.required, Validators.min(2), Validators.max(50)]],
  });

  ngOnInit(): void {
    const existente = this.meetup();
    if (existente) {
      this.formulario.setValue({
        titulo: existente.titulo,
        descripcion: existente.descripcion ?? '',
        tipo: existente.tipo,
        fechaHora: existente.fechaHora.slice(0, 16),
        lugar: existente.lugar,
        cupoMaximo: existente.cupoMaximo,
      });
    }
  }

  protected invalido(campo: keyof MeetupFormulario['formulario']['controls']): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected guardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.guardando()) {
      return;
    }
    const { titulo, descripcion, tipo, fechaHora, lugar, cupoMaximo } = this.formulario.getRawValue();
    const datos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      tipo,
      fechaHora,
      lugar: lugar.trim(),
      cupoMaximo,
    };
    const existente = this.meetup();
    this.guardando.set(true);
    this.error.set(null);
    const peticion = existente ? this.api.actualizar(existente.id, datos) : this.api.crear(datos);
    peticion.subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.guardado.emit(resultado);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.error.set(mensajeDe(e));
      },
    });
  }
}
