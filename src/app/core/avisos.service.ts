import { Injectable, signal } from '@angular/core';
import { Genero } from './api.models';

export interface Toast {
  id: number;
  texto: string;
  tipo: 'ok' | 'error' | 'info';
}

export interface Celebracion {
  personaId: number;
  nombre: string;
  foto: string | null;
  genero: Genero | null;
}

@Injectable({ providedIn: 'root' })
export class Avisos {
  private siguiente = 1;
  readonly toasts = signal<Toast[]>([]);
  readonly celebracion = signal<Celebracion | null>(null);

  ok(texto: string): void {
    this.agregar(texto, 'ok');
  }

  error(texto: string): void {
    this.agregar(texto, 'error');
  }

  info(texto: string): void {
    this.agregar(texto, 'info');
  }

  celebrar(datos: Celebracion): void {
    this.celebracion.set(datos);
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance('Yeehaw'));
    } catch {
      return;
    }
  }

  cerrarCelebracion(): void {
    this.celebracion.set(null);
  }

  quitar(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private agregar(texto: string, tipo: Toast['tipo']): void {
    const id = this.siguiente++;
    this.toasts.update((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => this.quitar(id), 4500);
  }
}
