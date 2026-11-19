import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { mensajeDe } from '../../core/errores';
import { Universidad } from '../../core/models';

type Modo = 'login' | 'registro';

export const PATRON_PASSWORD = /^(?=.*[A-Z])(?=.*[0-9]).{8,72}$/;

@Component({
  selector: 'app-acceso',
  imports: [ReactiveFormsModule],
  templateUrl: './acceso.html',
})
export class Acceso implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly modo = signal<Modo>('login');
  protected readonly universidades = signal<Universidad[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly verPassword = signal(false);

  protected readonly formulario = this.fb.group({
    universidadId: [0],
    nombres: [''],
    apellidos: [''],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.auth.universidades().subscribe({
      next: (lista) => this.universidades.set(lista),
      error: () => this.error.set('No se pudo cargar la lista de universidades'),
    });
  }

  protected cambiarModo(modo: Modo): void {
    this.modo.set(modo);
    this.error.set(null);
    this.aviso.set(null);
    const { universidadId, nombres, apellidos, password } = this.formulario.controls;
    if (modo === 'registro') {
      universidadId.setValidators([Validators.min(1)]);
      nombres.setValidators([Validators.required, Validators.maxLength(100)]);
      apellidos.setValidators([Validators.required, Validators.maxLength(100)]);
      password.setValidators([Validators.required, Validators.pattern(PATRON_PASSWORD)]);
    } else {
      universidadId.clearValidators();
      nombres.clearValidators();
      apellidos.clearValidators();
      password.setValidators([Validators.required]);
    }
    universidadId.updateValueAndValidity();
    nombres.updateValueAndValidity();
    apellidos.updateValueAndValidity();
    password.updateValueAndValidity();
  }

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const { universidadId, nombres, apellidos, correo, password } = this.formulario.getRawValue();
    const peticion: Observable<unknown> =
      this.modo() === 'login'
        ? this.auth.iniciarSesion({ correo, password })
        : this.auth.registrar({ correo, password, nombres, apellidos, universidadId });
    peticion.subscribe({
      next: () => {
        this.enviando.set(false);
        if (this.modo() === 'registro') {
          this.cambiarModo('login');
          this.aviso.set('Cuenta creada. Revisa tu correo institucional y verifica tu dirección antes de iniciar sesión.');
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDe(e));
      },
    });
  }

  protected invalido(campo: 'universidadId' | 'nombres' | 'apellidos' | 'correo' | 'password'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }
}
