import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conexion } from './models';

@Injectable({ providedIn: 'root' })
export class ConexionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/conexiones`;

  contactos(): Observable<Conexion[]> {
    return this.http.get<Conexion[]>(this.base);
  }

  recibidas(): Observable<Conexion[]> {
    return this.http.get<Conexion[]>(`${this.base}/recibidas`);
  }

  enviadas(): Observable<Conexion[]> {
    return this.http.get<Conexion[]>(`${this.base}/enviadas`);
  }

  solicitar(destinatarioId: number): Observable<Conexion> {
    return this.http.post<Conexion>(this.base, { destinatarioId });
  }

  aceptar(id: number): Observable<Conexion> {
    return this.http.post<Conexion>(`${this.base}/${id}/aceptar`, {});
  }

  rechazar(id: number): Observable<Conexion> {
    return this.http.post<Conexion>(`${this.base}/${id}/rechazar`, {});
  }

  cancelar(id: number): Observable<Conexion> {
    return this.http.post<Conexion>(`${this.base}/${id}/cancelar`, {});
  }
}
