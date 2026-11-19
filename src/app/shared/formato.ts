export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function nombreCompleto(persona: { nombres: string; apellidos: string }): string {
  return `${persona.nombres} ${persona.apellidos}`.trim();
}

export function iniciales(persona: { nombres: string; apellidos: string }): string {
  return (persona.nombres.charAt(0) + persona.apellidos.charAt(0)).toUpperCase();
}

export function hayCupo(meetup: { confirmados: number; cupoMaximo: number }): boolean {
  return meetup.confirmados < meetup.cupoMaximo;
}
