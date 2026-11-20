import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDeError(error: unknown, porDefecto = 'Algo salió mal. Inténtalo de nuevo.'): string {
  if (!(error instanceof HttpErrorResponse)) return porDefecto;
  if (error.status === 0) return 'No hay conexión con el servidor. Revisa tu internet.';
  if (error.status === 429) return 'Demasiados intentos. Espera unos minutos e inténtalo otra vez.';
  if (error.status === 413) return 'El archivo es demasiado grande.';
  const cuerpo = error.error as { message?: string } | null;
  const texto = typeof cuerpo?.message === 'string' ? cuerpo.message : '';
  if (error.status === 401) return 'Tu sesión venció o las credenciales no son correctas.';
  if (error.status === 403) return texto || 'No tienes permiso para hacer esto.';
  if (error.status === 404) return 'No se encontró lo que buscabas.';
  if (error.status === 409) return texto || 'Esa acción ya se hizo o entra en conflicto con otra.';
  if (error.status === 400) return texto || 'Revisa los datos ingresados.';
  return porDefecto;
}
