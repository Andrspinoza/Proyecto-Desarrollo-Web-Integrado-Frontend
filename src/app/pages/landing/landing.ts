import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { metaUniversidad } from '../../core/universidades';

interface PerfilEjemplo {
  foto: string;
  nombre: string;
  edad: number;
  meta: string;
  afinidad: number;
  comparten: string;
  chips: string[];
}

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-line">
      <div class="max-w-[1200px] mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <a routerLink="/" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-xl">
          <img src="logo-quesale-naranja.png" alt="" class="h-9 w-9 object-contain" /> ¿Qué sale?
        </a>
        <nav class="hidden md:flex items-center gap-7 text-sm font-semibold" aria-label="Secciones">
          <a href="#universidades" (click)="irA($event, 'universidades')" class="text-muted hover:text-ink no-underline">Universidades</a>
          <a href="#como" (click)="irA($event, 'como')" class="text-muted hover:text-ink no-underline">Cómo funciona</a>
          <a href="#por-que" (click)="irA($event, 'por-que')" class="text-muted hover:text-ink no-underline">Por qué ¿Qué sale?</a>
        </nav>
        <nav class="flex items-center gap-2" aria-label="Acceso">
          <a routerLink="/acceso" class="btn btn-ghost !min-h-10">Iniciar sesión</a>
          <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-10 hidden sm:inline-flex">Crear cuenta</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#fff0e6,transparent_60%)]">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p class="chip chip-on !text-[13px] mb-4"><span class="icon !text-[16px]">school</span> Por y para estudiantes universitarios</p>
            <h1 class="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] m-0 text-ink">Estudiar, conocerse… <span class="text-brand">o lo que salga.</span></h1>
            <p class="text-muted text-lg mt-5 mb-8 max-w-xl leading-relaxed">Descubre estudiantes de tu universidad con gustos afines, conecta de verdad y organiza planes para dos o juntadas grupales: un café, vóley, un grupo de estudio.</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-12 !text-base">Crear mi cuenta</a>
              <a routerLink="/acceso" class="btn btn-ghost !min-h-12 !text-base">Ya tengo cuenta</a>
            </div>
            <p class="text-xs text-muted mt-4 mb-0 flex items-center gap-1.5"><span class="icon !text-[16px] text-ok icon-fill">verified_user</span> Solo con correo institucional verificado</p>
          </div>

          <div class="relative mx-auto w-full max-w-sm lg:max-w-md pt-10 pb-14" (mouseenter)="pausar()" (mouseleave)="reanudar()">
            <div class="absolute inset-x-0 top-4 bottom-10 rounded-[2rem] bg-brand-soft -rotate-3" aria-hidden="true"></div>

            <span
              class="absolute z-10 top-0 right-2 sm:-right-3 rounded-2xl rounded-br-md bg-ink text-white font-bold text-sm px-4 py-2.5 shadow-lg rotate-2 transition-opacity duration-300"
              [class.opacity-0]="cambiando()"
              aria-hidden="true"
              >{{ frase() }}</span
            >

            <div class="card relative p-5 sm:p-6 shadow-xl">
              <div class="transition-opacity duration-300" [class.opacity-0]="cambiando()">
                <div class="flex items-start gap-4">
                  <img [src]="perfil().foto" alt="" width="84" height="84" class="w-[84px] h-[84px] rounded-full object-cover shrink-0 ring-4 ring-brand-soft" />
                  <div class="min-w-0 flex-1 pt-1">
                    <p class="m-0 font-display font-bold text-xl">{{ perfil().nombre }}, {{ perfil().edad }}</p>
                    <p class="m-0 text-sm text-muted">{{ perfil().meta }}</p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-5">
                  @for (c of perfil().chips; track c; let i = $index) {
                    <span class="chip" [class.chip-on]="i < 2">{{ c }}</span>
                  }
                </div>
                <div class="mt-4 mb-5 rounded-xl bg-canvas border border-line p-4">
                  <div class="flex items-baseline justify-between">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-muted">Coincidencia</span>
                    <span class="font-display font-extrabold text-2xl text-brand leading-none">{{ perfil().afinidad }}%</span>
                  </div>
                  <div class="h-2 rounded-full bg-line mt-2 overflow-hidden">
                    <div class="h-full rounded-full bg-brand transition-[width] duration-500" [style.width.%]="perfil().afinidad"></div>
                  </div>
                  <p class="text-xs text-muted mt-2 mb-0">{{ perfil().comparten }}</p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" class="btn btn-ghost !min-h-11 !px-2" (click)="siguiente()">Pasar</button>
                <button type="button" class="btn btn-primary !min-h-11 !px-2 col-span-2" (click)="siguiente()">Me interesa</button>
              </div>
            </div>

            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2" role="group" aria-label="Perfiles de ejemplo">
              <button type="button" class="w-8 h-8 rounded-full grid place-items-center text-muted hover:bg-white hover:text-brand" (click)="anterior()" aria-label="Perfil anterior">
                <span class="icon">chevron_left</span>
              </button>
              @for (p of perfiles; track p.nombre; let i = $index) {
                <button
                  type="button"
                  class="h-2 rounded-full transition-all"
                  [class.w-6]="i === indice()"
                  [class.bg-brand]="i === indice()"
                  [class.w-2]="i !== indice()"
                  [class.bg-line]="i !== indice()"
                  (click)="ir(i)"
                  [attr.aria-label]="'Ver a ' + p.nombre"
                ></button>
              }
              <button type="button" class="w-8 h-8 rounded-full grid place-items-center text-muted hover:bg-white hover:text-brand" (click)="siguiente()" aria-label="Perfil siguiente">
                <span class="icon">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="universidades" class="scroll-mt-16 bg-white border-y border-line">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div class="text-center">
            <p class="chip chip-on !text-[13px] m-0"><span class="icon !text-[16px]">account_balance</span> Universidades</p>
            <h2 class="font-display text-3xl sm:text-4xl font-bold mt-4 mb-0">Tu universidad, tu gente</h2>
            <p class="text-muted max-w-2xl mx-auto mt-3 mb-0">Cada cuenta pertenece a una universidad y solo descubre estudiantes, planes y comunidades de la suya.</p>
          </div>
          <div class="cinta mt-10">
            <ul class="carril list-none m-0 p-0">
              @for (u of universidades; track u.dominio) {
                <li class="h-20 w-40 shrink-0 rounded-2xl border border-line bg-white flex items-center justify-center px-4" [attr.title]="u.meta.nombre">
                  <img [src]="u.meta.logo" [alt]="u.meta.nombre" class="object-contain max-w-full" [style.height.px]="u.alto" />
                </li>
              }
              @for (u of universidades; track u.dominio) {
                <li class="copia h-20 w-40 shrink-0 rounded-2xl border border-line bg-white flex items-center justify-center px-4" aria-hidden="true">
                  <img [src]="u.meta.logo" alt="" class="object-contain max-w-full" [style.height.px]="u.alto" />
                </li>
              }
            </ul>
          </div>
          <p class="text-center text-sm text-muted mt-6 mb-0">{{ universidades.length }} universidades y contando.</p>
        </div>
      </section>

      <section id="como" class="scroll-mt-16">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div class="text-center">
            <p class="chip chip-on !text-[13px] m-0"><span class="icon !text-[16px]">route</span> Cómo funciona</p>
            <h2 class="font-display text-3xl sm:text-4xl font-bold mt-4 mb-0">Tres pasos. Nada más.</h2>
          </div>
          <ol class="list-none m-0 mt-10 p-0 grid sm:grid-cols-3 gap-4 sm:gap-6">
            @for (paso of pasos; track paso.n) {
              <li class="card p-6">
                <span class="inline-flex w-10 h-10 rounded-full bg-brand text-white font-display font-bold items-center justify-center">{{ paso.n }}</span>
                <h3 class="font-display text-xl font-bold mt-4 mb-2">{{ paso.titulo }}</h3>
                <p class="text-muted m-0 leading-relaxed">{{ paso.texto }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <section id="por-que" class="scroll-mt-16 bg-white border-y border-line">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div class="text-center">
            <p class="chip chip-on !text-[13px] m-0"><span class="icon !text-[16px]">auto_awesome</span> Por qué ¿Qué sale?</p>
            <h2 class="font-display text-3xl sm:text-4xl font-bold mt-4 mb-0">Hecho para conocerse bien</h2>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            @for (f of ventajas; track f.titulo) {
              <div class="card p-5">
                <span class="icon icon-fill text-brand !text-[30px]">{{ f.icono }}</span>
                <h3 class="font-display text-lg font-bold mt-3 mb-1">{{ f.titulo }}</h3>
                <p class="text-muted text-sm m-0 leading-relaxed">{{ f.texto }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="px-4 sm:px-6 py-14">
        <div class="max-w-[1200px] mx-auto rounded-3xl bg-ink text-white p-8 sm:p-12 text-center">
          <h2 class="font-display text-3xl sm:text-4xl font-bold m-0 text-white">¿Qué sale hoy?</h2>
          <p class="text-white/75 mt-3 mb-6">Crea tu cuenta en un minuto y encuentra a tu gente.</p>
          <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-12 !text-base">Empezar ahora</a>
        </div>
      </section>
    </main>

    <footer class="border-t border-line bg-white">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 text-xs text-muted flex flex-col sm:flex-row gap-2 justify-between">
        <span>© 2026 ¿Qué sale? · Los logos son marcas de sus respectivas universidades.</span>
        <span>Por y para estudiantes universitarios</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .cinta {
        overflow: hidden;
        mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
      }
      .carril {
        display: flex;
        gap: 0.75rem;
        width: max-content;
        animation: desfile 40s linear infinite;
      }
      .cinta:hover .carril {
        animation-play-state: paused;
      }
      @keyframes desfile {
        to {
          transform: translateX(calc(-50% - 0.375rem));
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .cinta {
          mask-image: none;
        }
        .carril {
          animation: none;
          width: auto;
          flex-wrap: wrap;
          justify-content: center;
        }
        .copia {
          display: none;
        }
      }
    `,
  ],
})
export class Landing {
  protected readonly perfiles: PerfilEjemplo[] = [
    { foto: 'perfiles/camila.jpg', nombre: 'Camila', edad: 22, meta: 'Ing. de Sistemas · ciclo 7', afinidad: 92, comparten: 'Comparten café, vóley y planes después de clases.', chips: ['Café', 'Vóley', 'Videojuegos', 'Música indie'] },
    { foto: 'perfiles/diego.jpg', nombre: 'Diego', edad: 21, meta: 'Ing. Industrial · ciclo 5', afinidad: 74, comparten: 'Comparten fútbol, cine y el turno noche.', chips: ['Fútbol', 'Cine', 'Excel', 'Series'] },
    { foto: 'perfiles/valeria.jpg', nombre: 'Valeria', edad: 20, meta: 'Administración · ciclo 6', afinidad: 88, comparten: 'Comparten música en vivo, café y la misma sede.', chips: ['Música en vivo', 'Café', 'Fotografía', 'Viajes'] },
    { foto: 'perfiles/renzo.jpg', nombre: 'Renzo', edad: 23, meta: 'Ing. de Software · ciclo 8', afinidad: 68, comparten: 'Comparten videojuegos, frontend y el ciclo.', chips: ['Videojuegos', 'Frontend', 'Básquet', 'Anime'] },
    { foto: 'perfiles/alessia.jpg', nombre: 'Alessia', edad: 19, meta: 'Psicología · ciclo 4', afinidad: 86, comparten: 'Comparten voluntariado, café y lectura.', chips: ['Voluntariado', 'Café', 'Lectura', 'Yoga'] },
  ];

  private readonly frases = ['¿Y si hoy sí se arma?', '¡Tú mismo eres!', 'Ya pues, escríbele.', 'Un café y vemos qué sale.', 'Coincidieron. ¿Ahora qué?'];

  protected readonly indice = signal(0);
  protected readonly mostrado = signal(0);
  protected readonly cambiando = signal(false);
  protected readonly perfil = computed(() => this.perfiles[this.mostrado()]);
  protected readonly frase = computed(() => this.frases[this.mostrado() % this.frases.length]);

  protected readonly universidades = [
    { dominio: 'utp.edu.pe', alto: 26 },
    { dominio: 'upc.edu.pe', alto: 48 },
    { dominio: 'utec.edu.pe', alto: 30 },
    { dominio: 'aloe.ulima.edu.pe', alto: 30 },
    { dominio: 'usil.pe', alto: 42 },
    { dominio: 'upn.edu.pe', alto: 40 },
    { dominio: 'pucp.edu.pe', alto: 30 },
    { dominio: 'ucvvirtual.edu.pe', alto: 32 },
    { dominio: 'unmsm.edu.pe', alto: 30 },
    { dominio: 'uwiener.edu.pe', alto: 26 },
  ].map((u) => ({ ...u, meta: metaUniversidad(u.dominio) }));

  protected readonly pasos = [
    { n: 1, titulo: 'Crea tu cuenta', texto: 'Elige tu universidad y verifica tu correo institucional. Cuéntanos tu carrera, tu ciclo y tus gustos.' },
    { n: 2, titulo: 'Descubre a tu gente', texto: 'Te sugerimos estudiantes de tu universidad con intereses, carrera y sede en común, y te explicamos por qué.' },
    { n: 3, titulo: 'Conecta y propón un plan', texto: 'Cuando los dos aceptan conectar pueden conversar y organizar un café, un partido o una sesión de estudio.' },
  ];

  protected readonly ventajas = [
    { icono: 'favorite', titulo: 'Afinidad explicada', texto: 'Ves el porcentaje y el motivo: intereses, carrera, ciclo y sede en común.' },
    { icono: 'forum', titulo: 'Conexión real', texto: 'Solo pueden escribirse cuando los dos aceptan la conexión.' },
    { icono: 'event_available', titulo: 'Planes y comunidades', texto: 'Planes para dos, juntadas grupales y comunidades por interés dentro de tu universidad.' },
    { icono: 'verified_user', titulo: 'Solo universitarios', texto: 'Todos entran con su correo institucional. Puedes bloquear o reportar cuando quieras y tu correo nunca se muestra.' },
  ];

  private temporizador: ReturnType<typeof setInterval> | null = null;
  private readonly sinMovimiento = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    for (const p of this.perfiles) {
      const previa = new Image();
      previa.src = p.foto;
    }
    const alCambiarVisibilidad = () => (document.hidden ? this.pausar() : this.reanudar());
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    inject(DestroyRef).onDestroy(() => {
      this.pausar();
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    });
    this.reanudar();
  }

  protected irA(evento: Event, id: string): void {
    const destino = document.getElementById(id);
    if (!destino) return;
    evento.preventDefault();
    destino.scrollIntoView({ behavior: this.sinMovimiento ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + id);
  }

  protected siguiente(): void {
    this.manual(this.indice() + 1);
  }

  protected anterior(): void {
    this.manual(this.indice() - 1);
  }

  protected ir(i: number): void {
    this.manual(i);
  }

  protected pausar(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = null;
  }

  protected reanudar(): void {
    if (this.temporizador || this.sinMovimiento) return;
    this.temporizador = setInterval(() => this.mostrar(this.indice() + 1), 4200);
  }

  private manual(destino: number): void {
    this.pausar();
    this.mostrar(destino);
  }

  private mostrar(destino: number): void {
    const total = this.perfiles.length;
    const nuevo = (destino + total) % total;
    this.indice.set(nuevo);
    if (this.sinMovimiento) {
      this.mostrado.set(nuevo);
      return;
    }
    this.cambiando.set(true);
    setTimeout(() => {
      this.mostrado.set(nuevo);
      this.cambiando.set(false);
    }, 280);
  }
}
