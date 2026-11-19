import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Comunidad { id: number; name: string; description: string; memberCount: number }

@Component({
  selector: 'app-comunidades',
  imports: [FormsModule],
  template: `
    <section class="max-w-[1000px] mx-auto">
      <h1 class="font-headline-page text-headline-page text-on-surface mb-2">Comunidades</h1>
      <p class="text-text-secondary mb-6">Encuentra estudiantes de tu universidad con intereses en común.</p>
      @if (error()) { <p role="alert" class="bg-error-container text-error p-4 rounded-xl mb-4">{{ error() }}</p> }
      @if (aviso()) { <p role="status" class="text-primary mb-4">{{ aviso() }}</p> }
      <form (ngSubmit)="crear()" class="bg-surface rounded-xl p-6 border border-border-base mb-6">
        <h2 class="font-bold text-lg mb-3">Crear comunidad</h2>
        <label class="block mb-2">Nombre <input name="nombre" [(ngModel)]="nombre" required maxlength="80" class="block w-full border border-border-base rounded-lg p-2 mt-1" /></label>
        <label class="block mb-3">Descripción <textarea name="descripcion" [(ngModel)]="descripcion" maxlength="500" class="block w-full border border-border-base rounded-lg p-2 mt-1"></textarea></label>
        <button type="submit" [disabled]="ocupado() || !nombre.trim()" class="rounded-lg bg-primary text-on-primary px-4 py-2 disabled:opacity-50">Crear comunidad</button>
      </form>
      @if (cargando()) { <p>Cargando comunidades…</p> }
      @else if (!lista().length && !error()) { <p>Aún no hay comunidades en tu universidad. ¡Crea la primera!</p> }
      <div class="grid gap-4 md:grid-cols-2">
        @for (comunidad of lista(); track comunidad.id) {
          <article class="bg-surface rounded-xl p-6 border border-border-base">
            <h2 class="font-bold text-lg">{{ comunidad.name }}</h2>
            <p class="text-text-secondary my-2">{{ comunidad.description || 'Sin descripción.' }}</p>
            <p class="text-text-secondary text-sm mb-4">{{ comunidad.memberCount }} integrantes</p>
            <button type="button" (click)="unirse(comunidad.id)" [disabled]="ocupado()" class="rounded-lg bg-primary text-on-primary px-4 py-2 disabled:opacity-50">Unirme</button>
          </article>
        }
      </div>
    </section>`,
})
export class Comunidades implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly lista = signal<Comunidad[]>([]);
  protected readonly cargando = signal(false);
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected nombre = '';
  protected descripcion = '';
  ngOnInit(): void { this.cargar(); }
  protected crear(): void {
    const name = this.nombre.trim();
    if (!name || this.ocupado()) return;
    this.ocupado.set(true); this.error.set(null); this.aviso.set(null);
    this.http.post(`${environment.apiUrl}/communities`, { name, description: this.descripcion.trim() }).subscribe({
      next: () => { this.ocupado.set(false); this.nombre = ''; this.descripcion = ''; this.aviso.set('Comunidad creada. Ya formas parte de ella.'); this.cargar(); },
      error: () => { this.ocupado.set(false); this.error.set('No se pudo crear la comunidad. Inténtalo nuevamente.'); },
    });
  }
  protected unirse(id: number): void {
    if (this.ocupado()) return;
    this.ocupado.set(true); this.error.set(null); this.aviso.set(null);
    this.http.post(`${environment.apiUrl}/communities/${id}/members`, {}).subscribe({
      next: () => { this.ocupado.set(false); this.aviso.set('Te uniste a la comunidad.'); this.cargar(); },
      error: () => { this.ocupado.set(false); this.error.set('No fue posible unirte. Es posible que ya seas integrante.'); },
    });
  }
  private cargar(): void {
    this.cargando.set(true);
    this.http.get<Comunidad[]>(`${environment.apiUrl}/communities`).subscribe({
      next: (lista) => { this.lista.set(lista); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.error.set('No se pudieron cargar las comunidades.'); },
    });
  }
}
