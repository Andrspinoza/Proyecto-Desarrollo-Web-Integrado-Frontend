export interface MetaUniversidad {
  sigla: string;
  nombre: string;
  fondo: string;
  texto: string;
  sedes: string[];
}

const META: Record<string, MetaUniversidad> = {
  'utp.edu.pe': {
    sigla: 'UTP',
    nombre: 'Universidad Tecnológica del Perú',
    fondo: '#e30613',
    texto: '#ffffff',
    sedes: ['Lima Centro', 'Lima Norte', 'Lima Sur', 'Ate', 'Arequipa', 'Chiclayo', 'Trujillo', 'Piura', 'Huancayo', 'Ica', 'Cusco', 'Chimbote'],
  },
  'upc.edu.pe': {
    sigla: 'UPC',
    nombre: 'Universidad Peruana de Ciencias Aplicadas',
    fondo: '#d6001c',
    texto: '#ffffff',
    sedes: ['Monterrico', 'San Isidro', 'San Miguel', 'Villa'],
  },
  'utec.edu.pe': {
    sigla: 'UTEC',
    nombre: 'Universidad de Ingeniería y Tecnología',
    fondo: '#00a3b4',
    texto: '#ffffff',
    sedes: ['Barranco'],
  },
  'aloe.ulima.edu.pe': {
    sigla: 'ULIMA',
    nombre: 'Universidad de Lima',
    fondo: '#f58220',
    texto: '#ffffff',
    sedes: ['Santiago de Surco'],
  },
  'usil.pe': {
    sigla: 'USIL',
    nombre: 'Universidad San Ignacio de Loyola',
    fondo: '#00539b',
    texto: '#ffffff',
    sedes: ['La Molina', 'San Isidro', 'Lima Centro'],
  },
  'upn.edu.pe': {
    sigla: 'UPN',
    nombre: 'Universidad Privada del Norte',
    fondo: '#0a3d91',
    texto: '#ffffff',
    sedes: ['Los Olivos', 'Breña', 'San Juan de Lurigancho', 'San Miguel', 'Chorrillos', 'Trujillo', 'Cajamarca'],
  },
  'pucp.edu.pe': {
    sigla: 'PUCP',
    nombre: 'Pontificia Universidad Católica del Perú',
    fondo: '#003a70',
    texto: '#ffffff',
    sedes: ['San Miguel'],
  },
};

const GENERICA: MetaUniversidad = {
  sigla: 'UNI',
  nombre: 'Universidad',
  fondo: '#526078',
  texto: '#ffffff',
  sedes: [],
};

export function metaUniversidad(dominio: string | null | undefined): MetaUniversidad {
  if (!dominio) return GENERICA;
  return META[dominio.toLowerCase()] ?? { ...GENERICA, sigla: dominio.split('.')[0].toUpperCase().slice(0, 5) };
}

export const CARRERAS = [
  'Administración',
  'Arquitectura',
  'Ciencias de la Computación',
  'Comunicaciones',
  'Contabilidad',
  'Derecho',
  'Diseño Gráfico',
  'Economía',
  'Educación',
  'Enfermería',
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Ingeniería de Software',
  'Ingeniería Industrial',
  'Marketing',
  'Medicina',
  'Psicología',
  'Turismo',
];

export function correoEsDeLaUniversidad(correo: string, dominio: string | null | undefined): boolean {
  if (!dominio) return false;
  const partes = correo.trim().toLowerCase().split('@');
  return partes.length === 2 && partes[0].length > 0 && partes[1] === dominio.toLowerCase();
}
