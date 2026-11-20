import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BloqueoApi,
  ComunidadApi,
  ConexionApi,
  EstudianteApi,
  ItemCatalogo,
  MeetupApi,
  MeetupDatos,
  MensajeApi,
  ParticipacionApi,
  PerfilDatos,
  PublicacionApi,
  Recomendacion,
  ResumenEstudiante,
  SesionApi,
  Universidad,
} from './api.models';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  universidades(): Observable<Universidad[]> {
    return this.http.get<Universidad[]>(`${this.base}/universities`);
  }

  registrar(datos: { universityId: number; email: string; password: string; firstName: string; lastName: string }): Observable<{ studentId: number; message: string }> {
    return this.http.post<{ studentId: number; message: string }>(`${this.base}/auth/register`, datos);
  }

  iniciarSesion(email: string, password: string): Observable<SesionApi> {
    return this.http.post<SesionApi>(`${this.base}/auth/login`, { email, password });
  }

  reenviarVerificacion(email: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/resend-verification`, { email, password });
  }

  confirmarCorreo(token: string): Observable<unknown> {
    return this.http.get(`${this.base}/email-verifications/confirm`, { params: new HttpParams().set('token', token) });
  }

  olvideMiClave(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/forgot-password`, { email });
  }

  restablecerClave(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/reset-password`, { token, password });
  }

  yo(): Observable<EstudianteApi> {
    return this.http.get<EstudianteApi>(`${this.base}/students/me`);
  }

  estudiante(id: number): Observable<EstudianteApi> {
    return this.http.get<EstudianteApi>(`${this.base}/students/${id}`);
  }

  guardarPerfil(datos: PerfilDatos): Observable<EstudianteApi> {
    return this.http.put<EstudianteApi>(`${this.base}/students/me/profile`, datos);
  }

  subirFoto(archivo: Blob): Observable<{ photoUrl: string }> {
    const formulario = new FormData();
    formulario.append('file', archivo, 'foto.jpg');
    return this.http.put<{ photoUrl: string }>(`${this.base}/students/me/photo`, formulario);
  }

  quitarFoto(): Observable<void> {
    return this.http.delete<void>(`${this.base}/students/me/photo`);
  }

  intereses(): Observable<ItemCatalogo[]> {
    return this.http.get<ItemCatalogo[]>(`${this.base}/interests`);
  }

  habilidades(): Observable<ItemCatalogo[]> {
    return this.http.get<ItemCatalogo[]>(`${this.base}/skills`);
  }

  recomendaciones(limite = 30): Observable<Recomendacion[]> {
    return this.http.get<Recomendacion[]>(`${this.base}/students/recommendations`, { params: new HttpParams().set('limit', limite) });
  }

  buscar(texto: string): Observable<ResumenEstudiante[]> {
    return this.http.get<ResumenEstudiante[]>(`${this.base}/students/discover`, { params: new HttpParams().set('q', texto) });
  }

  conexiones(): Observable<ConexionApi[]> {
    return this.http.get<ConexionApi[]>(`${this.base}/connections`);
  }

  recibidas(): Observable<ConexionApi[]> {
    return this.http.get<ConexionApi[]>(`${this.base}/connections/received`);
  }

  enviadas(): Observable<ConexionApi[]> {
    return this.http.get<ConexionApi[]>(`${this.base}/connections/sent`);
  }

  conectar(recipientId: number): Observable<ConexionApi> {
    return this.http.post<ConexionApi>(`${this.base}/connections`, { recipientId });
  }

  aceptar(id: number): Observable<ConexionApi> {
    return this.http.patch<ConexionApi>(`${this.base}/connections/${id}/accept`, {});
  }

  rechazar(id: number): Observable<ConexionApi> {
    return this.http.patch<ConexionApi>(`${this.base}/connections/${id}/reject`, {});
  }

  cancelar(id: number): Observable<ConexionApi> {
    return this.http.patch<ConexionApi>(`${this.base}/connections/${id}/cancel`, {});
  }

  conversacion(otroId: number): Observable<MensajeApi[]> {
    return this.http.get<MensajeApi[]>(`${this.base}/messages/conversations/${otroId}`);
  }

  enviarMensaje(recipientId: number, content: string): Observable<MensajeApi> {
    return this.http.post<MensajeApi>(`${this.base}/messages`, { recipientId, content });
  }

  bloqueos(): Observable<BloqueoApi[]> {
    return this.http.get<BloqueoApi[]>(`${this.base}/blocks`);
  }

  bloquear(blockedStudentId: number): Observable<BloqueoApi> {
    return this.http.post<BloqueoApi>(`${this.base}/blocks`, { blockedStudentId });
  }

  desbloquear(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/blocks/${id}`);
  }

  reportar(targetId: number, reason: string, detail: string): Observable<unknown> {
    return this.http.post(`${this.base}/reports`, { targetType: 'STUDENT', targetId, reason, detail });
  }

  meetups(): Observable<MeetupApi[]> {
    return this.http.get<MeetupApi[]>(`${this.base}/meetups`);
  }

  misMeetups(): Observable<MeetupApi[]> {
    return this.http.get<MeetupApi[]>(`${this.base}/meetups/mine`);
  }

  crearMeetup(datos: MeetupDatos): Observable<MeetupApi> {
    return this.http.post<MeetupApi>(`${this.base}/meetups`, datos);
  }

  cancelarMeetup(id: number): Observable<MeetupApi> {
    return this.http.patch<MeetupApi>(`${this.base}/meetups/${id}/cancel`, {});
  }

  solicitarMeetup(id: number): Observable<ParticipacionApi> {
    return this.http.post<ParticipacionApi>(`${this.base}/meetups/${id}/participations`, {});
  }

  retirarseMeetup(id: number): Observable<ParticipacionApi> {
    return this.http.patch<ParticipacionApi>(`${this.base}/meetups/${id}/participations/me/withdraw`, {});
  }

  confirmarParticipante(meetupId: number, studentId: number): Observable<ParticipacionApi> {
    return this.http.patch<ParticipacionApi>(`${this.base}/meetups/${meetupId}/participations/${studentId}/confirm`, {});
  }

  invitarAMeetup(meetupId: number, studentId: number): Observable<ParticipacionApi> {
    return this.http.post<ParticipacionApi>(`${this.base}/meetups/${meetupId}/invitations`, { studentId });
  }

  aceptarInvitacion(meetupId: number): Observable<ParticipacionApi> {
    return this.http.patch<ParticipacionApi>(`${this.base}/meetups/${meetupId}/invitations/me/accept`, {});
  }

  rechazarInvitacion(meetupId: number): Observable<ParticipacionApi> {
    return this.http.patch<ParticipacionApi>(`${this.base}/meetups/${meetupId}/invitations/me/decline`, {});
  }

  comunidades(): Observable<ComunidadApi[]> {
    return this.http.get<ComunidadApi[]>(`${this.base}/communities`);
  }

  crearComunidad(name: string, description: string): Observable<ComunidadApi> {
    return this.http.post<ComunidadApi>(`${this.base}/communities`, { name, description });
  }

  unirseComunidad(id: number): Observable<unknown> {
    return this.http.post(`${this.base}/communities/${id}/members`, {});
  }

  salirComunidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/communities/${id}/members/me`);
  }

  publicaciones(id: number): Observable<PublicacionApi[]> {
    return this.http.get<PublicacionApi[]>(`${this.base}/communities/${id}/posts`);
  }

  publicar(id: number, content: string): Observable<PublicacionApi> {
    return this.http.post<PublicacionApi>(`${this.base}/communities/${id}/posts`, { content });
  }
}
