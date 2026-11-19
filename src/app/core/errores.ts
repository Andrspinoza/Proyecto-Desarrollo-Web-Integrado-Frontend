import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDe(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const detalles: string[] = error.error?.detalles ?? [];
    if (detalles.length > 0) {
      return detalles.join('. ');
    }
    if (typeof error.error?.mensaje === 'string') {
      return error.error.mensaje;
    }
    if (error.status === 0) {
      return 'No hay conexión con el servidor';
    }
  }
  return 'Ocurrió un error inesperado';
}
