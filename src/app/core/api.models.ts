export type Genero = 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
export type Visibilidad = 'PUBLIC' | 'PRIVATE';
export type EstadoConexion = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface Universidad {
  id: number;
  name: string;
  emailDomain: string;
  active: boolean;
}

export interface ItemCatalogo {
  id: number;
  name: string;
}

export interface PerfilApi {
  career: string;
  cycle: number;
  description: string | null;
  visibility: Visibilidad | null;
  interestIds: number[];
  skillIds: number[];
  gender: Genero | null;
  age: number | null;
  campus: string | null;
  birthDate: string | null;
}

export interface EstudianteApi {
  id: number;
  recordId: string | null;
  universityId: number | null;
  email: string | null;
  firstName: string;
  lastName: string;
  createdAt: string | null;
  profile: PerfilApi | null;
  photoUrl: string | null;
}

export interface PerfilDatos {
  career: string;
  cycle: number;
  description: string;
  visibility: Visibilidad;
  gender: Genero;
  birthDate: string | null;
  campus: string;
  interestIds: number[];
  skillIds: number[];
}

export interface Recomendacion {
  id: number;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: Genero | null;
  career: string;
  cycle: number;
  campus: string | null;
  description: string | null;
  affinityPercent: number;
  sharedInterests: string[];
  sharedSkills: string[];
  sameCareer: boolean;
  sameCampus: boolean;
  cycleDifference: number;
  interests: string[];
  photoUrl: string | null;
}

export interface ResumenEstudiante {
  id: number;
  firstName: string;
  lastName: string;
}

export interface SesionApi {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  studentId: number;
}

export interface ConexionApi {
  id: number;
  requesterId: number;
  recipientId: number;
  status: EstadoConexion;
  createdAt: string;
  respondedAt: string | null;
}

export interface MensajeApi {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  sentAt: string;
}

export interface AvisoMatch {
  connectionId: number;
  matchedStudentId: number;
  matchedFirstName: string | null;
  matchedAt: string;
}

export interface BloqueoApi {
  id: number;
  blockerId: number;
  blockedId: number;
  createdAt: string;
}

export type TipoMeetup = 'ACADEMIC' | 'SOCIAL';
export type EstadoMeetup = 'SCHEDULED' | 'CANCELLED' | 'FINISHED';
export type EstadoParticipacion = 'REQUESTED' | 'INVITED' | 'CONFIRMED' | 'DECLINED' | 'WITHDRAWN';

export interface LugarApi {
  name: string;
  address: string;
  district: string;
}

export interface ParticipacionApi {
  id: number;
  studentId: number;
  status: EstadoParticipacion;
  registeredAt: string;
}

export interface MeetupApi {
  id: number;
  organizerId: number;
  universityId: number;
  title: string;
  description: string | null;
  type: TipoMeetup;
  visibility: Visibilidad;
  scheduledAt: string;
  place: LugarApi;
  capacity: number;
  status: EstadoMeetup;
  availableSpots: number;
  participations: ParticipacionApi[];
}

export interface MeetupDatos {
  title: string;
  description: string;
  type: TipoMeetup;
  visibility: Visibilidad;
  scheduledAt: string;
  place: LugarApi;
  capacity: number;
}

export interface ComunidadApi {
  id: number;
  universityId: number;
  name: string;
  description: string | null;
  creatorId: number;
  memberCount: number;
  createdAt: string;
}

export interface PublicacionApi {
  id: number;
  communityId: number;
  authorId: number;
  content: string;
  createdAt: string;
}
