import { Injectable, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'quesale-tema';
const COLOR_BARRA: Record<Tema, string> = { claro: '#b84100', oscuro: '#12151c' };

export function temaInicial(guardado: string | null, prefiereOscuro: boolean): Tema {
  if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  return prefiereOscuro ? 'oscuro' : 'claro';
}

@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(
    temaInicial(this.leer(), typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches),
  );

  constructor() {
    this.aplicar(this.tema());
  }

  alternar(): void {
    const nuevo: Tema = this.tema() === 'oscuro' ? 'claro' : 'oscuro';
    this.tema.set(nuevo);
    this.aplicar(nuevo);
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      return;
    }
  }

  private leer(): string | null {
    try {
      return localStorage.getItem(CLAVE);
    } catch {
      return null;
    }
  }

  private aplicar(tema: Tema): void {
    document.documentElement.classList.toggle('oscuro', tema === 'oscuro');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema]);
  }
}
