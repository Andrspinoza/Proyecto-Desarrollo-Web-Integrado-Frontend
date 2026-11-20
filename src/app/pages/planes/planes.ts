import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { ConexionApi, MeetupApi, ParticipacionApi, TipoMeetup, Visibilidad } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PersonasService } from '../../core/personas.service';
import { Avatar } from '../../ui/avatar';
import { Modal } from '../../ui/modal';

export function ahoraLocal(): string {
  const d = new Date(Date.now() + 3600_000);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

export function fechaFutura(valor: string, ahora = Date.now()): boolean {
  const t = new Date(valor).getTime();
  return Number.isFinite(t) && t > ahora;
}

@Component({
  selector: 'app-planes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Modal, Avatar],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 class="font-display font-extrabold text-3xl m-0">Planes</h1>
          <p class="text-muted mt-1 mb-0">Planes para dos y juntadas grupales dentro de tu universidad.</p>
        </div>
        <button type="button" class="btn btn-primary shrink-0" (click)="abrirCrear()"><span class="icon">add</span><span class="hidden sm:inline">Crear plan</span></button>
      </div>

      <div class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#ece7f1] mb-5 max-w-sm" role="tablist">
        <button type="button" role="tab" class="btn !min-h-10 border-0" [attr.aria-selected]="pestana() === 'explorar'" [class.btn-primary]="pestana() === 'explorar'" [class.btn-ghost]="pestana() !== 'explorar'" [class.!bg-transparent]="pestana() !== 'explorar'" (click)="pestana.set('explorar')">Explorar</button>
        <button type="button" role="tab" class="btn !min-h-10 border-0" [attr.aria-selected]="pestana() === 'mios'" [class.btn-primary]="pestana() === 'mios'" [class.btn-ghost]="pestana() !== 'mios'" [class.!bg-transparent]="pestana() !== 'mios'" (click)="pestana.set('mios')">Mis planes</button>
      </div>

      @if (cargando()) { <div class="card p-8 text-center text-muted">Cargando planes…</div> }
      @else if (visibles().length === 0) {
        <div class="card p-8 text-center">
          <span class="icon text-brand !text-[40px]">event_busy</span>
          <p class="font-display text-lg font-bold mt-2 mb-1">{{ pestana() === 'mios' ? 'Aún no tienes planes' : 'No hay planes publicados' }}</p>
          <p class="text-muted m-0">Crea uno: un café, un partido o una sesión de estudio.</p>
          <button type="button" class="btn btn-primary mt-5" (click)="abrirCrear()">Crear un plan</button>
        </div>
      } @else {
        <ul class="list-none p-0 m-0 grid sm:grid-cols-2 gap-4">
          @for (m of visibles(); track m.id) {
            <li>
              <button type="button" class="card w-full p-4 text-left cursor-pointer hover:border-brand rise h-full" (click)="abrir(m)">
                <div class="flex items-center gap-2 mb-2">
                  <span class="chip" [class.chip-on]="m.type === 'SOCIAL'">{{ m.type === 'SOCIAL' ? 'Social' : 'Académico' }}</span>
                  @if (m.capacity === 2) { <span class="chip">Para dos</span> }
                  @if (m.status !== 'SCHEDULED') { <span class="chip !bg-danger-soft !text-danger">{{ m.status === 'CANCELLED' ? 'Cancelado' : 'Finalizado' }}</span> }
                </div>
                <h2 class="font-display text-lg font-bold m-0 leading-snug">{{ m.title }}</h2>
                <p class="text-sm text-muted mt-1 mb-0 flex items-center gap-1"><span class="icon !text-[16px]">schedule</span>{{ m.scheduledAt | date: "EEE d MMM, h:mm a" }}</p>
                <p class="text-sm text-muted mt-0.5 mb-0 flex items-center gap-1"><span class="icon !text-[16px]">location_on</span>{{ m.place.name }} · {{ m.place.district }}</p>
                <p class="text-xs font-bold mt-3 mb-0" [class.text-ok]="m.availableSpots > 0" [class.text-danger]="m.availableSpots === 0">{{ m.availableSpots > 0 ? m.availableSpots + ' de ' + m.capacity + ' cupos libres' : 'Sin cupos' }}</p>
              </button>
            </li>
          }
        </ul>
      }
    </div>

    @if (detalle(); as m) {
      <app-modal [titulo]="m.title" (cerrar)="detalle.set(null)">
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2"><span class="chip" [class.chip-on]="m.type === 'SOCIAL'">{{ m.type === 'SOCIAL' ? 'Social' : 'Académico' }}</span><span class="chip">{{ m.visibility === 'PUBLIC' ? 'Público' : 'Privado' }}</span><span class="chip">{{ m.capacity }} cupos</span></div>
          @if (m.description) { <p class="m-0 leading-relaxed">{{ m.description }}</p> }
          <ul class="list-none p-0 m-0 text-sm space-y-1.5 text-muted">
            <li class="flex gap-2"><span class="icon !text-[18px]">schedule</span>{{ m.scheduledAt | date: "EEEE d 'de' MMMM, h:mm a" }}</li>
            <li class="flex gap-2"><span class="icon !text-[18px]">location_on</span>{{ m.place.name }}, {{ m.place.address }} · {{ m.place.district }}</li>
            <li class="flex gap-2"><span class="icon !text-[18px]">person</span>Organiza {{ personas.nombre(m.organizerId) }}</li>
          </ul>

          <div>
            <h3 class="font-display text-base font-bold m-0 mb-2">Participantes</h3>
            @if (activos(m).length === 0) { <p class="text-sm text-muted m-0">Todavía nadie.</p> }
            <ul class="list-none p-0 m-0 space-y-2">
              @for (p of activos(m); track p.id) {
                <li class="flex items-center gap-2">
                  <app-avatar [foto]="personas.de(p.studentId)?.photoUrl ?? null" [genero]="personas.de(p.studentId)?.profile?.gender ?? null" [nombre]="personas.nombre(p.studentId)" [tam]="32" />
                  <span class="flex-1 text-sm font-bold truncate">{{ personas.nombre(p.studentId) }}</span>
                  <span class="chip">{{ etiqueta(p.status) }}</span>
                  @if (esMio(m) && p.status === 'REQUESTED') { <button type="button" class="btn btn-primary !min-h-8 !px-3 !text-xs" [disabled]="ocupado()" (click)="confirmar(m, p)">Confirmar</button> }
                </li>
              }
            </ul>
          </div>

          @if (esMio(m) && m.status === 'SCHEDULED' && invitables().length > 0) {
            <div>
              <label class="label" for="invitar">Invitar a una conexión</label>
              <div class="flex gap-2">
                <select id="invitar" class="field" [value]="invitado()" (change)="invitado.set(+$any($event.target).value)">
                  <option value="0">Elige a alguien…</option>
                  @for (id of invitables(); track id) { <option [value]="id">{{ personas.nombre(id) }}</option> }
                </select>
                <button type="button" class="btn btn-ghost" [disabled]="ocupado() || invitado() === 0" (click)="invitar(m)">Invitar</button>
              </div>
            </div>
          }

          @if (m.status === 'SCHEDULED') {
            <div class="flex flex-col sm:flex-row gap-2 pt-2">
              @if (esMio(m)) {
                <button type="button" class="btn btn-danger flex-1" [disabled]="ocupado()" (click)="cancelarPlan(m)">Cancelar plan</button>
              } @else {
                @switch (miEstado(m)) {
                  @case ('INVITED') {
                    <button type="button" class="btn btn-primary flex-1" [disabled]="ocupado()" (click)="responder(m, true)">Aceptar invitación</button>
                    <button type="button" class="btn btn-ghost flex-1" [disabled]="ocupado()" (click)="responder(m, false)">Rechazar</button>
                  }
                  @case ('REQUESTED') { <button type="button" class="btn btn-ghost flex-1" [disabled]="ocupado()" (click)="retirarme(m)">Solicitud enviada · Retirarme</button> }
                  @case ('CONFIRMED') { <button type="button" class="btn btn-ghost flex-1" [disabled]="ocupado()" (click)="retirarme(m)">Estás dentro · Retirarme</button> }
                  @default { <button type="button" class="btn btn-primary flex-1" [disabled]="ocupado() || m.availableSpots === 0" (click)="solicitar(m)">{{ m.availableSpots === 0 ? 'Sin cupos' : 'Solicitar unirme' }}</button> }
                }
              }
            </div>
          }
        </div>
      </app-modal>
    }

    @if (creando()) {
      <app-modal titulo="Crear plan" (cerrar)="creando.set(false)">
        <form class="space-y-4" (submit)="crear($event)" novalidate>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" class="btn !min-h-11" [class.btn-primary]="f().capacity === 2" [class.btn-ghost]="f().capacity !== 2" (click)="preset('dos')"><span class="icon">people</span> Para dos</button>
            <button type="button" class="btn !min-h-11" [class.btn-primary]="f().capacity !== 2" [class.btn-ghost]="f().capacity === 2" (click)="preset('grupal')"><span class="icon">groups</span> Grupal</button>
          </div>
          <div><label class="label" for="titulo">Título</label><input id="titulo" class="field" maxlength="100" placeholder="Ej. Café después de clases" [value]="f().title" (input)="set('title', $any($event.target).value)" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label" for="tipo">Tipo</label><select id="tipo" class="field" [value]="f().type" (change)="set('type', $any($event.target).value)"><option value="SOCIAL">Social</option><option value="ACADEMIC">Académico</option></select></div>
            <div><label class="label" for="cupo">Cupos</label><input id="cupo" type="number" min="2" max="100" class="field" [value]="f().capacity" (input)="set('capacity', +$any($event.target).value)" /></div>
          </div>
          <div><label class="label" for="fecha">Fecha y hora</label><input id="fecha" type="datetime-local" class="field" [min]="minimo" [value]="f().fecha" (input)="set('fecha', $any($event.target).value)" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label" for="lugar">Lugar</label><input id="lugar" class="field" placeholder="Ej. Cafetería central" [value]="f().lugar" (input)="set('lugar', $any($event.target).value)" /></div>
            <div><label class="label" for="distrito">Distrito</label><input id="distrito" class="field" placeholder="Ej. Lima" [value]="f().distrito" (input)="set('distrito', $any($event.target).value)" /></div>
          </div>
          <div><label class="label" for="direccion">Dirección</label><input id="direccion" class="field" placeholder="Calle y número" [value]="f().direccion" (input)="set('direccion', $any($event.target).value)" /></div>
          <div><label class="label" for="desc">Descripción (opcional)</label><textarea id="desc" class="field" maxlength="500" [value]="f().description" (input)="set('description', $any($event.target).value)"></textarea></div>
          <label class="flex items-center gap-2 text-sm font-bold"><input type="checkbox" [checked]="f().visibility === 'PRIVATE'" (change)="set('visibility', $any($event.target).checked ? 'PRIVATE' : 'PUBLIC')" /> Privado: solo por invitación</label>
          @if (errorCrear()) { <p class="error-text m-0">{{ errorCrear() }}</p> }
          <button type="submit" class="btn btn-primary w-full !min-h-12" [disabled]="ocupado()">{{ ocupado() ? 'Creando…' : 'Crear plan' }}</button>
        </form>
      </app-modal>
    }
  `,
})
export class Planes implements OnInit {
  protected readonly personas = inject(PersonasService);
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);

  protected readonly pestana = signal<'explorar' | 'mios'>('explorar');
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly todos = signal<MeetupApi[]>([]);
  protected readonly mios = signal<MeetupApi[]>([]);
  protected readonly detalle = signal<MeetupApi | null>(null);
  protected readonly creando = signal(false);
  protected readonly errorCrear = signal('');
  protected readonly conexiones = signal<number[]>([]);
  protected readonly invitado = signal(0);
  protected readonly minimo = ahoraLocal();

  protected readonly f = signal({
    title: '', type: 'SOCIAL' as TipoMeetup, capacity: 2, fecha: '', lugar: '', distrito: '', direccion: '',
    description: '', visibility: 'PRIVATE' as Visibilidad,
  });

  protected readonly visibles = computed(() => (this.pestana() === 'mios' ? this.mios() : this.todos()));
  protected readonly invitables = computed(() => {
    const m = this.detalle();
    if (m === null) return [];
    const dentro = new Set(m.participations.map((p) => p.studentId));
    return this.conexiones().filter((id) => !dentro.has(id));
  });

  ngOnInit(): void {
    this.cargar();
    this.api.conexiones().subscribe({
      next: (lista: ConexionApi[]) => {
        const yo = this.auth.yo()?.id;
        const ids = lista.filter((c) => c.status === 'ACCEPTED').map((c) => (c.requesterId === yo ? c.recipientId : c.requesterId));
        this.conexiones.set(ids);
        this.personas.cargar(ids).subscribe();
      },
      error: () => undefined,
    });
  }

  private cargar(): void {
    forkJoin({ t: this.api.meetups(), m: this.api.misMeetups() }).subscribe({
      next: ({ t, m }) => {
        this.todos.set(t);
        this.mios.set(m);
        const ids = [...t, ...m].flatMap((x) => [x.organizerId, ...x.participations.map((p) => p.studentId)]);
        this.personas.cargar(ids).subscribe(() => this.cargando.set(false));
        const abierto = this.detalle();
        if (abierto) this.detalle.set([...t, ...m].find((x) => x.id === abierto.id) ?? null);
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected abrir(m: MeetupApi): void {
    this.invitado.set(0);
    this.detalle.set(m);
  }

  protected esMio(m: MeetupApi): boolean {
    return m.organizerId === this.auth.yo()?.id;
  }

  protected miEstado(m: MeetupApi): string | null {
    const p = m.participations.find((x) => x.studentId === this.auth.yo()?.id);
    return p && p.status !== 'DECLINED' && p.status !== 'WITHDRAWN' ? p.status : null;
  }

  protected activos(m: MeetupApi): ParticipacionApi[] {
    return m.participations.filter((p) => p.status !== 'DECLINED' && p.status !== 'WITHDRAWN');
  }

  protected etiqueta(estado: string): string {
    return ({ REQUESTED: 'Solicitó', INVITED: 'Invitado', CONFIRMED: 'Confirmado' } as Record<string, string>)[estado] ?? estado;
  }

  protected abrirCrear(): void {
    this.errorCrear.set('');
    this.f.set({ title: '', type: 'SOCIAL', capacity: 2, fecha: '', lugar: '', distrito: '', direccion: '', description: '', visibility: 'PRIVATE' });
    this.creando.set(true);
  }

  protected preset(tipo: 'dos' | 'grupal'): void {
    this.f.update((x) => (tipo === 'dos' ? { ...x, capacity: 2, visibility: 'PRIVATE' } : { ...x, capacity: 6, visibility: 'PUBLIC' }));
  }

  protected set<K extends keyof ReturnType<typeof this.f>>(clave: K, valor: ReturnType<typeof this.f>[K]): void {
    this.f.update((x) => ({ ...x, [clave]: valor }));
  }

  protected crear(evento: Event): void {
    evento.preventDefault();
    const x = this.f();
    if (x.title.trim().length < 3) return this.errorCrear.set('Ponle un título al plan.');
    if (!fechaFutura(x.fecha)) return this.errorCrear.set('Elige una fecha y hora futuras.');
    if (!x.lugar.trim() || !x.direccion.trim() || !x.distrito.trim()) return this.errorCrear.set('Indica lugar, dirección y distrito.');
    if (x.capacity < 2) return this.errorCrear.set('Un plan necesita al menos 2 cupos (contándote a ti).');
    this.errorCrear.set('');
    this.ocupado.set(true);
    this.api.crearMeetup({
      title: x.title.trim(), description: x.description.trim(), type: x.type, visibility: x.visibility,
      scheduledAt: new Date(x.fecha).toISOString(), capacity: x.capacity,
      place: { name: x.lugar.trim(), address: x.direccion.trim(), district: x.distrito.trim() },
    }).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.creando.set(false);
        this.pestana.set('mios');
        this.avisos.ok('Plan creado.');
        this.cargar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.errorCrear.set(mensajeDeError(e, 'No pudimos crear el plan.'));
      },
    });
  }

  private accion(llamada: () => { subscribe: (o: { next: () => void; error: (e: unknown) => void }) => unknown }, ok: string): void {
    this.ocupado.set(true);
    llamada().subscribe({
      next: () => {
        this.ocupado.set(false);
        this.avisos.ok(ok);
        this.cargar();
      },
      error: (e: unknown) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
  }

  protected solicitar(m: MeetupApi): void { this.accion(() => this.api.solicitarMeetup(m.id), 'Solicitud enviada.'); }
  protected retirarme(m: MeetupApi): void { this.accion(() => this.api.retirarseMeetup(m.id), 'Te retiraste del plan.'); }
  protected cancelarPlan(m: MeetupApi): void { this.accion(() => this.api.cancelarMeetup(m.id), 'Plan cancelado.'); }
  protected confirmar(m: MeetupApi, p: ParticipacionApi): void { this.accion(() => this.api.confirmarParticipante(m.id, p.studentId), 'Participante confirmado.'); }
  protected invitar(m: MeetupApi): void { this.accion(() => this.api.invitarAMeetup(m.id, this.invitado()), 'Invitación enviada.'); }
  protected responder(m: MeetupApi, acepta: boolean): void {
    this.accion(() => (acepta ? this.api.aceptarInvitacion(m.id) : this.api.rechazarInvitacion(m.id)), acepta ? '¡Estás dentro!' : 'Invitación rechazada.');
  }
}
