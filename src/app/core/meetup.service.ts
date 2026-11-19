import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FiltroMeetups, Meetup, MeetupDatos, Participacion, Participante } from './models';
import { parametros } from './perfil.service';

@Injectable({ providedIn: 'root' })
export class MeetupService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listar(filtro: FiltroMeetups): Observable<Meetup[]> {
    return this.http.get<Meetup[]>(`${this.base}/meetups`, { params: parametros(filtro) });
  }

  organizados(): Observable<Meetup[]> {
    return this.http.get<Meetup[]>(`${this.base}/meetups/mios`);
  }

  participando(): Observable<Meetup[]> {
    return this.http.get<Meetup[]>(`${this.base}/participaciones/mias`);
  }

  obtener(id: number): Observable<Meetup> {
    return this.http.get<Meetup>(`${this.base}/meetups/${id}`);
  }

  crear(datos: MeetupDatos): Observable<Meetup> {
    return this.http.post<Meetup>(`${this.base}/meetups`, datos);
  }

  actualizar(id: number, datos: MeetupDatos): Observable<Meetup> {
    return this.http.put<Meetup>(`${this.base}/meetups/${id}`, datos);
  }

  cancelar(id: number): Observable<Meetup> {
    return this.http.post<Meetup>(`${this.base}/meetups/${id}/cancelar`, {});
  }

  solicitar(meetupId: number): Observable<Participacion> {
    return this.http.post<Participacion>(`${this.base}/meetups/${meetupId}/participaciones`, {});
  }

  retirar(meetupId: number): Observable<Participacion> {
    return this.http.delete<Participacion>(`${this.base}/meetups/${meetupId}/participaciones/yo`);
  }

  participantes(meetupId: number): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${this.base}/meetups/${meetupId}/participantes`);
  }

  aprobar(participacionId: number): Observable<Participacion> {
    return this.http.post<Participacion>(`${this.base}/participaciones/${participacionId}/aprobar`, {});
  }

  rechazar(participacionId: number): Observable<Participacion> {
    return this.http.post<Participacion>(`${this.base}/participaciones/${participacionId}/rechazar`, {});
  }

  exportar(meetupId: number): Observable<Blob> {
    return this.http.get(`${this.base}/meetups/${meetupId}/participantes/exportar`, {
      responseType: 'blob',
    });
  }
}
