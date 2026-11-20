import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { Api } from './api.service';
import { EstudianteApi, Universidad } from './api.models';

const CLAVE_TOKEN = 'quesale.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly _token = signal<string | null>(leer(CLAVE_TOKEN));
  private readonly _yo = signal<EstudianteApi | null>(null);
  private readonly _universidades = signal<Universidad[]>([]);

  readonly autenticado = computed(() => this._token() !== null);
  readonly yo = this._yo.asReadonly();
  readonly universidades = this._universidades.asReadonly();
  readonly universidad = computed(() => this._universidades().find((u) => u.id === this._yo()?.universityId) ?? null);
  readonly nombre = computed(() => this._yo()?.firstName ?? '');
  readonly perfilCompleto = computed(() => this._yo()?.profile != null);

  token(): string | null {
    return this._token();
  }

  iniciarSesion(email: string, password: string): Observable<EstudianteApi | null> {
    return this.api.iniciarSesion(email, password).pipe(
      tap((sesion) => {
        this._token.set(sesion.accessToken);
        escribir(CLAVE_TOKEN, sesion.accessToken);
      }),
      switchMap(() => this.cargarYo()),
    );
  }

  cargarYo(): Observable<EstudianteApi | null> {
    if (this._token() === null) return of(null);
    return this.api.yo().pipe(
      tap((yo) => this._yo.set(yo)),
      map((yo) => yo as EstudianteApi | null),
    );
  }

  cargarUniversidades(): Observable<Universidad[]> {
    if (this._universidades().length > 0) return of(this._universidades());
    return this.api.universidades().pipe(
      map((lista) => lista.filter((u) => u.active)),
      tap((lista) => this._universidades.set(lista)),
    );
  }

  actualizarYo(yo: EstudianteApi): void {
    this._yo.set(yo);
  }

  cerrarSesion(): void {
    this._token.set(null);
    this._yo.set(null);
    escribir(CLAVE_TOKEN, null);
    this.router.navigate(['/acceso']);
  }
}

function leer(clave: string): string | null {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string | null): void {
  try {
    if (valor === null) sessionStorage.removeItem(clave);
    else sessionStorage.setItem(clave, valor);
  } catch {
    return;
  }
}
