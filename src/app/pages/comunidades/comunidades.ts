import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin, of, catchError, map } from 'rxjs';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { ComunidadApi, PublicacionApi } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PersonasService } from '../../core/personas.service';
import { Modal } from '../../ui/modal';

@Component({
  selector: 'app-comunidades',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Modal],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 class="font-display font-extrabold text-3xl m-0">Comunidades</h1>
          <p class="text-muted mt-1 mb-0">Grupos permanentes por interés dentro de tu universidad.</p>
        </div>
        <button type="button" class="btn btn-primary shrink-0" (click)="creando.set(true)"><span class="icon">add</span><span class="hidden sm:inline">Crear comunidad</span></button>
      </div>

      @if (cargando()) { <div class="card p-8 text-center text-muted">Cargando…</div> }
      @else if (lista().length === 0) {
        <div class="card p-8 text-center"><span class="icon text-brand !text-[40px]">diversity_3</span><p class="font-display text-lg font-bold mt-2 mb-1">Aún no hay comunidades</p><p class="text-muted m-0">Crea la primera: vóley, gaming, música, estudio…</p></div>
      } @else {
        <ul class="list-none p-0 m-0 grid sm:grid-cols-2 gap-4">
          @for (c of lista(); track c.id) {
            <li class="card p-4 flex flex-col rise">
              <div class="flex items-start gap-3">
                <span class="w-12 h-12 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><span class="icon icon-fill">diversity_3</span></span>
                <div class="min-w-0"><h2 class="font-display text-lg font-bold m-0 leading-snug">{{ c.name }}</h2><p class="text-xs text-muted m-0">{{ c.memberCount }} {{ c.memberCount === 1 ? 'miembro' : 'miembros' }}</p></div>
              </div>
              @if (c.description) { <p class="text-sm text-muted mt-3 mb-0 leading-relaxed">{{ c.description }}</p> }
              <div class="flex gap-2 mt-4 pt-3 border-t border-line mt-auto">
                @if (esMiembro(c.id)) {
                  <button type="button" class="btn btn-primary flex-1 !min-h-10" (click)="abrir(c)">Ver publicaciones</button>
                  <button type="button" class="btn btn-ghost !min-h-10" [disabled]="ocupado()" (click)="salir(c)">Salir</button>
                } @else {
                  <button type="button" class="btn btn-primary flex-1 !min-h-10" [disabled]="ocupado()" (click)="unirse(c)">Unirme</button>
                }
              </div>
            </li>
          }
        </ul>
      }
    </div>

    @if (activa(); as c) {
      <app-modal [titulo]="c.name" (cerrar)="activa.set(null)">
        <form class="flex gap-2 mb-4" (submit)="publicar($event, c)">
          <input class="field flex-1" maxlength="1000" placeholder="Comparte algo con la comunidad…" aria-label="Publicación" [value]="texto()" (input)="texto.set($any($event.target).value)" />
          <button type="submit" class="btn btn-primary" [disabled]="ocupado() || !texto().trim()">Publicar</button>
        </form>
        @if (posts().length === 0) { <p class="text-muted text-center m-0 py-4">Aún no hay publicaciones.</p> }
        <ul class="list-none p-0 m-0 space-y-3">
          @for (p of posts(); track p.id) {
            <li class="p-3 rounded-xl bg-[#f5f3f8]">
              <p class="m-0 text-xs font-bold text-muted">{{ personas.nombre(p.authorId) }} · {{ p.createdAt | date: 'd MMM, h:mm a' }}</p>
              <p class="m-0 mt-1 leading-relaxed break-words">{{ p.content }}</p>
            </li>
          }
        </ul>
      </app-modal>
    }

    @if (creando()) {
      <app-modal titulo="Crear comunidad" (cerrar)="creando.set(false)">
        <form class="space-y-4" (submit)="crear($event)">
          <div><label class="label" for="nombre">Nombre</label><input id="nombre" class="field" maxlength="80" placeholder="Ej. Vóley UTP" [value]="nombre()" (input)="nombre.set($any($event.target).value)" /></div>
          <div><label class="label" for="descripcion">Descripción</label><textarea id="descripcion" class="field" maxlength="300" [value]="descripcion()" (input)="descripcion.set($any($event.target).value)"></textarea></div>
          <button type="submit" class="btn btn-primary w-full !min-h-12" [disabled]="ocupado() || nombre().trim().length < 3">Crear comunidad</button>
        </form>
      </app-modal>
    }
  `,
})
export class Comunidades implements OnInit {
  protected readonly personas = inject(PersonasService);
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);

  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly lista = signal<ComunidadApi[]>([]);
  protected readonly miembro = signal<ReadonlySet<number>>(new Set());
  protected readonly activa = signal<ComunidadApi | null>(null);
  protected readonly posts = signal<PublicacionApi[]>([]);
  protected readonly texto = signal('');
  protected readonly creando = signal(false);
  protected readonly nombre = signal('');
  protected readonly descripcion = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  protected esMiembro(id: number): boolean {
    return this.miembro().has(id);
  }

  private cargar(): void {
    this.api.comunidades().subscribe({
      next: (lista) => {
        this.lista.set(lista);
        const yo = this.auth.yo()?.id;
        if (lista.length === 0) return this.cargando.set(false);
        forkJoin(lista.map((c) => this.api.publicaciones(c.id).pipe(map(() => c.id), catchError(() => of(null))))).subscribe((ids) => {
          this.miembro.set(new Set(ids.filter((x): x is number => x !== null)));
          this.cargando.set(false);
        });
        void yo;
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected unirse(c: ComunidadApi): void {
    this.ocupado.set(true);
    this.api.unirseComunidad(c.id).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok(`Te uniste a ${c.name}.`);
        this.cargar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected salir(c: ComunidadApi): void {
    this.ocupado.set(true);
    this.api.salirComunidad(c.id).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok(`Saliste de ${c.name}.`);
        this.cargar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected abrir(c: ComunidadApi): void {
    this.activa.set(c);
    this.posts.set([]);
    this.api.publicaciones(c.id).subscribe({
      next: (lista) => {
        this.posts.set(lista);
        this.personas.cargar(lista.map((p) => p.authorId)).subscribe();
      },
      error: (e: unknown) => this.avisos.error(mensajeDeError(e)),
    });
  }

  protected publicar(evento: Event, c: ComunidadApi): void {
    evento.preventDefault();
    const contenido = this.texto().trim();
    if (!contenido) return;
    this.ocupado.set(true);
    this.api.publicar(c.id, contenido).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.texto.set('');
        this.abrir(c);
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected crear(evento: Event): void {
    evento.preventDefault();
    this.ocupado.set(true);
    this.api.crearComunidad(this.nombre().trim(), this.descripcion().trim()).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.creando.set(false);
        this.nombre.set('');
        this.descripcion.set('');
        this.avisos.ok('Comunidad creada.');
        this.cargar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }
}
