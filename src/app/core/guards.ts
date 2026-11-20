import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? true : inject(Router).createUrlTree(['/acceso']);
};

export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? inject(Router).createUrlTree(['/descubrir']) : true;
};

export const perfilGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.autenticado()) return router.createUrlTree(['/acceso']);
  const decidir = () => (auth.perfilCompleto() ? true : router.createUrlTree(['/bienvenida']));
  if (auth.yo() !== null) return decidir();
  return auth.cargarYo().pipe(
    map(() => decidir()),
    catchError(() => of(router.createUrlTree(['/acceso']))),
  );
};
