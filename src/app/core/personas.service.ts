import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { Api } from './api.service';
import { EstudianteApi } from './api.models';

@Injectable({ providedIn: 'root' })
export class PersonasService {
  private readonly api = inject(Api);
  private readonly cache = signal<ReadonlyMap<number, EstudianteApi>>(new Map());

  readonly personas = this.cache.asReadonly();

  de(id: number): EstudianteApi | undefined {
    return this.cache().get(id);
  }

  cargar(ids: number[]): Observable<void> {
    const faltan = [...new Set(ids)].filter((id) => !this.cache().has(id));
    if (faltan.length === 0) return of(undefined);
    return forkJoin(faltan.map((id) => this.api.estudiante(id).pipe(catchError(() => of(null))))).pipe(
      tap((lista) => {
        const siguiente = new Map(this.cache());
        for (const persona of lista) if (persona !== null) siguiente.set(persona.id, persona);
        this.cache.set(siguiente);
      }),
      map(() => undefined),
    );
  }

  guardar(persona: EstudianteApi): void {
    const siguiente = new Map(this.cache());
    siguiente.set(persona.id, persona);
    this.cache.set(siguiente);
  }

  nombre(id: number): string {
    const persona = this.cache().get(id);
    return persona ? `${persona.firstName} ${persona.lastName}`.trim() : 'Estudiante';
  }
}
