import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRespuesta, LoginDatos, RegistroDatos, Universidad, Usuario } from './models';

interface UniversidadApi { id: number; name: string; emailDomain: string; active: boolean }
interface EstudianteApi { id: number; email: string; firstName: string; lastName: string; universityId: number }
interface SesionApi { accessToken: string; tokenType: string; expiresIn: number; studentId: number }
interface RegistroRespuesta { studentId: number; message: string }

const CLAVE_TOKEN = 'quesale.token';
const CLAVE_USUARIO = 'quesale.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly _token = signal<string | null>(leer(CLAVE_TOKEN));
  private readonly _usuario = signal<Usuario | null>(leerUsuario());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);

  token(): string | null {
    return this._token();
  }

  universidades(): Observable<Universidad[]> {
    return this.http.get<UniversidadApi[]>(`${environment.apiUrl}/universities`).pipe(
      map((lista) => lista.filter((u) => u.active).map((u) => ({ id: u.id, nombre: u.name, dominioCorreo: u.emailDomain }))),
    );
  }

  registrar(datos: RegistroDatos): Observable<RegistroRespuesta> {
    return this.http.post<RegistroRespuesta>(`${environment.apiUrl}/auth/register`, {
      universityId: datos.universidadId, email: datos.correo, password: datos.password,
      firstName: datos.nombres, lastName: datos.apellidos,
    });
  }

  iniciarSesion(datos: LoginDatos): Observable<AuthRespuesta> {
    return this.http
      .post<SesionApi>(`${environment.apiUrl}/auth/login`, { email: datos.correo, password: datos.password })
      .pipe(switchMap((sesion) => forkJoin({
        estudiante: this.http.get<EstudianteApi>(`${environment.apiUrl}/students/${sesion.studentId}`, {
          headers: { Authorization: `Bearer ${sesion.accessToken}` },
        }),
        universidades: this.universidades(),
      }).pipe(map(({ estudiante, universidades }): AuthRespuesta => ({
        token: sesion.accessToken, tipo: sesion.tokenType, expiraEnSegundos: sesion.expiresIn,
        usuario: { estudianteId: estudiante.id, correo: estudiante.email, nombres: estudiante.firstName,
          apellidos: estudiante.lastName, universidadId: estudiante.universityId,
          universidad: universidades.find((u) => u.id === estudiante.universityId)?.nombre ?? 'Universidad', rol: 'ESTUDIANTE' },
      })))))
      .pipe(tap((respuesta) => this.guardar(respuesta)));
  }

  cerrarSesion(): void {
    this._token.set(null);
    this._usuario.set(null);
    escribir(CLAVE_TOKEN, null);
    escribir(CLAVE_USUARIO, null);
    this.router.navigate(['/acceso']);
  }

  private guardar(respuesta: AuthRespuesta): void {
    this._token.set(respuesta.token);
    this._usuario.set(respuesta.usuario);
    escribir(CLAVE_TOKEN, respuesta.token);
    escribir(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
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
    if (valor === null) {
      sessionStorage.removeItem(clave);
    } else {
      sessionStorage.setItem(clave, valor);
    }
  } catch {
    return;
  }
}

function leerUsuario(): Usuario | null {
  const texto = leer(CLAVE_USUARIO);
  if (texto === null) {
    return null;
  }
  try {
    return JSON.parse(texto) as Usuario;
  } catch {
    return null;
  }
}
