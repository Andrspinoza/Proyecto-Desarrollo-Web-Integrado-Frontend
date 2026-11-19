import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, invitadoGuard } from './guards';

function ejecutar(guarda: typeof authGuard): boolean | UrlTree {
  return TestBed.runInInjectionContext(() =>
    guarda({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  ) as boolean | UrlTree;
}

describe('guardas', () => {
  function preparar(token: string | null): void {
    sessionStorage.clear();
    if (token !== null) {
      sessionStorage.setItem('quesale.token', token);
    }
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  }

  it('authGuard deja pasar a quien tiene sesión', () => {
    preparar('abc');

    expect(ejecutar(authGuard)).toBe(true);
  });

  it('authGuard envía al acceso a quien no tiene sesión', () => {
    preparar(null);

    const resultado = ejecutar(authGuard);

    expect(resultado instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/acceso');
  });

  it('invitadoGuard deja pasar a quien no tiene sesión', () => {
    preparar(null);

    expect(ejecutar(invitadoGuard)).toBe(true);
  });

  it('invitadoGuard envía al inicio a quien ya tiene sesión', () => {
    preparar('abc');

    const resultado = ejecutar(invitadoGuard);

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/inicio');
  });
});
