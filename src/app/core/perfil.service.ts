import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FiltroEstudiantes, ItemCatalogo, Perfil, PerfilDatos } from './models';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  miPerfil(): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.base}/perfil/yo`);
  }

  actualizar(datos: PerfilDatos): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.base}/perfil/yo`, datos);
  }

  perfilDe(estudianteId: number): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.base}/estudiantes/${estudianteId}/perfil`);
  }

  buscar(filtro: FiltroEstudiantes): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(`${this.base}/estudiantes`, { params: parametros(filtro) });
  }

  intereses(): Observable<ItemCatalogo[]> {
    return this.http.get<ItemCatalogo[]>(`${this.base}/catalogos/intereses`);
  }

  habilidades(): Observable<ItemCatalogo[]> {
    return this.http.get<ItemCatalogo[]>(`${this.base}/catalogos/habilidades`);
  }
}

export function parametros(filtro: object): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtro)) {
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return params;
}
