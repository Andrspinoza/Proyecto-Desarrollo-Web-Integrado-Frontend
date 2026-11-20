import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Avisos } from '../../core/avisos.service';
import { ConexionApi, MensajeApi } from '../../core/api.models';
import { mensajeDeError } from '../../core/errores';
import { PersonasService } from '../../core/personas.service';
import { TiempoReal } from '../../core/tiempo-real.service';
import { Avatar } from '../../ui/avatar';

@Component({
  selector: 'app-mensajes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, Avatar],
  template: `
    <div class="card overflow-hidden grid md:grid-cols-[300px_1fr] h-[calc(100dvh-9.5rem)] lg:h-[calc(100dvh-8.5rem)] min-h-[420px]">
      <aside class="border-r border-line overflow-y-auto" [class.hidden]="seleccionado() !== null" [class.md:block]="true">
        <h1 class="font-display text-xl font-bold m-0 p-4 border-b border-line">Mensajes</h1>
        @if (cargando()) { <p class="p-4 text-muted m-0">Cargando…</p> }
        @else if (contactos().length === 0) {
          <div class="p-6 text-center">
            <span class="icon text-brand !text-[36px]">chat_bubble</span>
            <p class="font-bold mt-2 mb-1">Aún no tienes conversaciones</p>
            <p class="text-sm text-muted m-0">Conecta con alguien para empezar a chatear.</p>
            <a routerLink="/conexiones" class="btn btn-ghost mt-4">Ver solicitudes</a>
          </div>
        } @else {
          <ul class="list-none p-0 m-0">
            @for (id of contactos(); track id) {
              <li>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 text-left bg-transparent border-0 cursor-pointer hover:bg-[#f5f3f8]" [class.bg-brand-soft]="seleccionado() === id" (click)="elegir(id)">
                  <app-avatar [foto]="personas.de(id)?.photoUrl ?? null" [genero]="personas.de(id)?.profile?.gender ?? null" [nombre]="personas.nombre(id)" [tam]="46" />
                  <span class="min-w-0"><span class="block font-bold truncate">{{ personas.nombre(id) }}</span><span class="block text-xs text-muted truncate">{{ personas.de(id)?.profile?.career }}</span></span>
                </button>
              </li>
            }
          </ul>
        }
      </aside>

      <section class="flex flex-col min-h-0" [class.hidden]="seleccionado() === null" [class.md:flex]="true">
        @if (seleccionado(); as id) {
          <header class="flex items-center gap-3 p-3 border-b border-line">
            <button type="button" class="md:hidden btn btn-ghost !min-h-10 !w-10 !px-0" aria-label="Volver a la lista" (click)="volver()"><span class="icon">arrow_back</span></button>
            <app-avatar [foto]="personas.de(id)?.photoUrl ?? null" [genero]="personas.de(id)?.profile?.gender ?? null" [nombre]="personas.nombre(id)" [tam]="40" />
            <a [routerLink]="['/personas', id]" class="font-bold text-ink no-underline flex-1 truncate">{{ personas.nombre(id) }}</a>
            <a routerLink="/planes" class="btn btn-ghost !min-h-10"><span class="icon !text-[20px]">event</span><span class="hidden sm:inline">Proponer un plan</span></a>
          </header>

          <div #hilo class="flex-1 overflow-y-auto p-4 space-y-2 bg-[#faf8fb]" aria-live="polite">
            @if (mensajes().length === 0) {
              <div class="text-center py-8">
                <p class="font-bold m-0">Rompe el hielo con {{ personas.de(id)?.firstName }}</p>
                <div class="flex flex-wrap gap-2 justify-center mt-3">
                  @for (s of sugerencias; track s) { <button type="button" class="chip chip-on cursor-pointer !min-h-9" (click)="texto.set(s)">{{ s }}</button> }
                </div>
              </div>
            }
            @for (m of mensajes(); track m.id) {
              <div class="flex" [class.justify-end]="m.senderId === auth.yo()?.id">
                <div class="max-w-[82%] px-3.5 py-2 rounded-2xl text-[15px] leading-snug break-words" [class.bg-brand]="m.senderId === auth.yo()?.id" [class.text-white]="m.senderId === auth.yo()?.id" [class.rounded-br-md]="m.senderId === auth.yo()?.id" [class.bg-white]="m.senderId !== auth.yo()?.id" [class.border]="m.senderId !== auth.yo()?.id" [class.border-line]="m.senderId !== auth.yo()?.id" [class.rounded-bl-md]="m.senderId !== auth.yo()?.id">
                  {{ m.content }}<span class="block text-[10px] mt-0.5 opacity-70 text-right">{{ m.sentAt | date: 'h:mm a' }}</span>
                </div>
              </div>
            }
          </div>

          <form class="flex gap-2 p-3 border-t border-line bg-white" (submit)="enviar($event)">
            <input class="field flex-1" name="mensaje" maxlength="1000" autocomplete="off" placeholder="Escribe un mensaje…" aria-label="Mensaje" [value]="texto()" (input)="texto.set($any($event.target).value)" />
            <button type="submit" class="btn btn-primary !min-w-12 !px-3" [disabled]="enviando() || !texto().trim()" aria-label="Enviar"><span class="icon icon-fill">send</span></button>
          </form>
        } @else {
          <div class="hidden md:grid place-items-center h-full text-center text-muted p-6">
            <div><span class="icon text-brand !text-[44px]">forum</span><p class="font-display text-lg font-bold text-ink mt-2 mb-1">Elige una conversación</p><p class="m-0">Tus conexiones aparecen a la izquierda.</p></div>
          </div>
        }
      </section>
    </div>
  `,
})
export class Mensajes implements OnInit {
  protected readonly personas = inject(PersonasService);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly tiempoReal = inject(TiempoReal);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destruir = inject(DestroyRef);
  private readonly hilo = viewChild<ElementRef<HTMLElement>>('hilo');

  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly contactos = signal<number[]>([]);
  protected readonly seleccionado = signal<number | null>(null);
  protected readonly mensajes = signal<MensajeApi[]>([]);
  protected readonly texto = signal('');
  protected readonly sugerencias = ['¡Hola! ¿Qué tal tu día?', '¿Tomamos un café después de clases?', '¿Qué plan te gustaría hacer esta semana?'];
  protected readonly nombreSeleccionado = computed(() => (this.seleccionado() === null ? '' : this.personas.nombre(this.seleccionado() as number)));

  constructor() {
    effect(() => {
      this.mensajes();
      queueMicrotask(() => {
        const el = this.hilo()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  ngOnInit(): void {
    this.api.conexiones().subscribe({
      next: (lista: ConexionApi[]) => {
        const yo = this.auth.yo()?.id;
        const ids = lista.filter((c) => c.status === 'ACCEPTED').map((c) => (c.requesterId === yo ? c.recipientId : c.requesterId));
        this.contactos.set(ids);
        this.personas.cargar(ids).subscribe(() => {
          this.cargando.set(false);
          const con = Number(this.ruta.snapshot.queryParamMap.get('con'));
          if (con && ids.includes(con)) this.elegir(con);
        });
      },
      error: (e: unknown) => {
        this.cargando.set(false);
        this.avisos.error(mensajeDeError(e));
      },
    });
    this.tiempoReal.mensajes.pipe(takeUntilDestroyed(this.destruir)).subscribe((m) => {
      if (m.senderId === this.seleccionado()) this.mensajes.update((lista) => (lista.some((x) => x.id === m.id) ? lista : [...lista, m]));
    });
  }

  protected elegir(id: number): void {
    this.seleccionado.set(id);
    this.mensajes.set([]);
    this.api.conversacion(id).subscribe({ next: (lista) => this.mensajes.set(lista), error: (e: unknown) => this.avisos.error(mensajeDeError(e)) });
  }

  protected volver(): void {
    this.seleccionado.set(null);
    void this.router.navigate([], { queryParams: {} });
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    const id = this.seleccionado();
    const contenido = this.texto().trim();
    if (id === null || !contenido) return;
    this.enviando.set(true);
    this.api.enviarMensaje(id, contenido).subscribe({
      next: (m) => {
        this.enviando.set(false);
        this.texto.set('');
        this.mensajes.update((lista) => [...lista, m]);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.avisos.error(mensajeDeError(e, 'No pudimos enviar el mensaje.'));
      },
    });
  }
}
