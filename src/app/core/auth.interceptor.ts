import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const esDeLaApi = peticion.url.startsWith(environment.apiUrl);
  const publica = peticion.url.includes('/auth/') || peticion.url.endsWith('/universities') || peticion.url.includes('/email-verifications/');
  const enviada = esDeLaApi && token !== null ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : peticion;
  return siguiente(enviada).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && esDeLaApi && !publica) {
        auth.cerrarSesion();
      }
      return throwError(() => error);
    }),
  );
};
