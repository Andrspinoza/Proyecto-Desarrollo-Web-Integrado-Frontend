export type Rol = 'ESTUDIANTE' | 'ADMINISTRADOR';
export type Visibilidad = 'PUBLICO' | 'PRIVADO';
export type TipoMeetup = 'ACADEMICO' | 'SOCIAL';
export type EstadoMeetup = 'PROGRAMADO' | 'CANCELADO' | 'REALIZADO';
export type EstadoParticipacion = 'SOLICITADA' | 'CONFIRMADA' | 'RECHAZADA' | 'RETIRADA';
export type EstadoConexion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA';

export interface Usuario {
  estudianteId: number;
  correo: string;
  nombres: string;
  apellidos: string;
  universidadId: number;
  universidad: string;
  rol: Rol;
}

export interface AuthRespuesta {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  usuario: Usuario;
}

export interface RegistroDatos {
  correo: string;
  password: string;
  nombres: string;
  apellidos: string;
  universidadId: number;
}

export interface LoginDatos {
  correo: string;
  password: string;
}

export interface Universidad {
  id: number;
  nombre: string;
  dominioCorreo: string;
}

export interface ItemCatalogo {
  id: number;
  nombre: string;
}

export interface Perfil {
  estudianteId: number;
  nombres: string;
  apellidos: string;
  universidad: string;
  carrera: string | null;
  ciclo: number | null;
  descripcion: string | null;
  visibilidad: Visibilidad;
  intereses: ItemCatalogo[];
  habilidades: ItemCatalogo[];
  restringido: boolean;
}

export interface PerfilDatos {
  carrera: string | null;
  ciclo: number | null;
  descripcion: string | null;
  visibilidad: Visibilidad;
  interesIds: number[];
  habilidadIds: number[];
}

export interface FiltroEstudiantes {
  universidadId?: number;
  carrera?: string;
  ciclo?: number;
  interesId?: number;
  habilidadId?: number;
}

export interface Meetup {
  id: number;
  titulo: string;
  descripcion: string | null;
  tipo: TipoMeetup;
  fechaHora: string;
  lugar: string;
  cupoMaximo: number;
  confirmados: number;
  estado: EstadoMeetup;
  organizadorId: number;
  organizador: string;
  universidad: string;
  esOrganizador: boolean;
  miParticipacion: EstadoParticipacion | null;
}

export interface MeetupDatos {
  titulo: string;
  descripcion: string | null;
  tipo: TipoMeetup;
  fechaHora: string;
  lugar: string;
  cupoMaximo: number;
}

export interface FiltroMeetups {
  tipo?: TipoMeetup;
  universidadId?: number;
  texto?: string;
}

export interface Participacion {
  id: number;
  meetupId: number;
  estado: EstadoParticipacion;
}

export interface Participante {
  participacionId: number;
  estudianteId: number;
  nombres: string;
  apellidos: string;
  universidad: string;
  estado: EstadoParticipacion;
  registradaEn: string;
}

export interface Conexion {
  id: number;
  estudianteId: number;
  nombres: string;
  apellidos: string;
  universidad: string;
  estado: EstadoConexion;
  enviadaPorMi: boolean;
  creadaEn: string;
}
