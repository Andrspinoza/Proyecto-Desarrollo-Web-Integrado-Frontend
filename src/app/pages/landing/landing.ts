import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../ui/avatar';
import { UniBadge } from '../../ui/uni-badge';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, UniBadge],
  template: `
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-line">
      <div class="max-w-[1200px] mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <a routerLink="/" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-xl">
          <img src="logo-quesale-naranja.png" alt="" class="h-9 w-9 object-contain" /> ¿Qué sale?
        </a>
        <nav class="flex items-center gap-2" aria-label="Acceso">
          <a routerLink="/acceso" class="btn btn-ghost !min-h-10">Iniciar sesión</a>
          <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-10 hidden sm:inline-flex">Crear cuenta</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="bg-[radial-gradient(ellipse_at_top_right,#fff0e6,transparent_60%)]">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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

          <div class="relative mx-auto w-full max-w-sm lg:max-w-md" aria-hidden="true">
            <div class="absolute -inset-6 rounded-[2rem] bg-brand-soft -rotate-3"></div>
            <div class="card relative p-5 sm:p-6 shadow-xl">
              <div class="flex items-start gap-4">
                <app-avatar genero="FEMALE" nombre="Camila" [tam]="84" />
                <div class="min-w-0 flex-1">
                  <p class="m-0 font-display font-bold text-xl">Camila, 22</p>
                  <p class="m-0 text-sm text-muted">Ing. de Sistemas · ciclo 7</p>
                </div>
                <div class="text-center shrink-0">
                  <p class="m-0 font-display font-extrabold text-3xl text-brand leading-none">92%</p>
                  <p class="m-0 text-[11px] font-bold text-muted">afinidad</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="chip chip-on">Café</span><span class="chip chip-on">Vóley</span><span class="chip">Videojuegos</span><span class="chip">Música indie</span>
              </div>
              <p class="text-sm text-muted mt-4 mb-5">Comparten café, vóley y planes después de clases.</p>
              <div class="grid grid-cols-3 gap-2">
                <span class="btn btn-ghost !min-h-11 !px-2">Pasar</span>
                <span class="btn btn-primary !min-h-11 !px-2 col-span-2">Me interesa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">Así funciona</h2>
        <div class="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
          @for (paso of pasos; track paso.n) {
            <div class="card p-6">
              <span class="inline-flex w-10 h-10 rounded-full bg-brand text-white font-display font-bold items-center justify-center">{{ paso.n }}</span>
              <h3 class="font-display text-xl font-bold mt-4 mb-2">{{ paso.titulo }}</h3>
              <p class="text-muted m-0 leading-relaxed">{{ paso.texto }}</p>
            </div>
          }
        </div>
      </section>

      <section class="bg-white border-y border-line">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">Universidades de la red</h2>
          <p class="text-muted text-center max-w-2xl mx-auto mt-3 mb-8">Cada cuenta pertenece a una universidad y solo descubre estudiantes, planes y comunidades de la suya. Se verifica con el correo institucional.</p>
          <ul class="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            @for (u of universidades; track u.dominio) {
              <li class="card p-4 flex flex-col items-center gap-3 text-center">
                <app-uni-badge [dominio]="u.dominio" [tam]="56" />
                <span class="text-xs font-bold text-muted leading-tight">{{ u.nombre }}</span>
              </li>
            }
          </ul>
          <p class="text-[11px] text-muted text-center mt-6 mb-0">Insignias de color con las siglas. Proyecto académico: no está afiliado ni respaldado por ninguna universidad.</p>
        </div>
      </section>

      <section class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">Hecho para conocerse bien</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          @for (f of ventajas; track f.titulo) {
            <div class="card p-5">
              <span class="icon icon-fill text-brand !text-[30px]">{{ f.icono }}</span>
              <h3 class="font-display text-lg font-bold mt-3 mb-1">{{ f.titulo }}</h3>
              <p class="text-muted text-sm m-0 leading-relaxed">{{ f.texto }}</p>
            </div>
          }
        </div>
      </section>

      <section class="px-4 sm:px-6 pb-14">
        <div class="max-w-[1200px] mx-auto rounded-3xl bg-ink text-white p-8 sm:p-12 text-center">
          <h2 class="font-display text-3xl sm:text-4xl font-bold m-0 text-white">¿Qué sale hoy?</h2>
          <p class="text-white/75 mt-3 mb-6">Crea tu cuenta en un minuto y encuentra a tu gente.</p>
          <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-12 !text-base">Empezar ahora</a>
        </div>
      </section>
    </main>

    <footer class="border-t border-line bg-white">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 text-xs text-muted flex flex-col sm:flex-row gap-2 justify-between">
        <span>© 2026 ¿Qué sale? · Proyecto de Desarrollo Web Integrado</span>
        <span>Por y para estudiantes universitarios</span>
      </div>
    </footer>
  `,
})
export class Landing {
  protected readonly pasos = [
    { n: 1, titulo: 'Crea tu cuenta', texto: 'Elige tu universidad y verifica tu correo institucional. Cuéntanos tu carrera, tu ciclo y tus gustos.' },
    { n: 2, titulo: 'Descubre a tu gente', texto: 'Te sugerimos estudiantes de tu universidad con intereses, carrera y sede en común, y te explicamos por qué.' },
    { n: 3, titulo: 'Conecta y propón un plan', texto: 'Cuando los dos aceptan conectar pueden conversar y organizar un café, un partido o una sesión de estudio.' },
  ];

  protected readonly universidades = [
    { dominio: 'utp.edu.pe', nombre: 'UTP' },
    { dominio: 'upc.edu.pe', nombre: 'UPC' },
    { dominio: 'utec.edu.pe', nombre: 'UTEC' },
    { dominio: 'aloe.ulima.edu.pe', nombre: 'Universidad de Lima' },
    { dominio: 'usil.pe', nombre: 'USIL' },
    { dominio: 'upn.edu.pe', nombre: 'UPN' },
    { dominio: 'pucp.edu.pe', nombre: 'PUCP' },
  ];

  protected readonly ventajas = [
    { icono: 'favorite', titulo: 'Afinidad explicada', texto: 'Ves el porcentaje y el motivo: intereses, carrera, ciclo y sede en común.' },
    { icono: 'forum', titulo: 'Conexión real', texto: 'Solo se puede chatear cuando los dos aceptan. Alta afinidad no abre un chat por sí sola.' },
    { icono: 'event_available', titulo: 'Planes y comunidades', texto: 'Planes para dos, meetups grupales y comunidades por interés dentro de tu universidad.' },
    { icono: 'shield', titulo: 'Seguro por diseño', texto: 'Solo correos institucionales, bloqueo y reportes siempre disponibles, sin mostrar tu correo.' },
  ];
}
