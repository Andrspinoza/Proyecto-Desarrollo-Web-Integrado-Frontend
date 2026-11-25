import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../ui/avatar';
import { UniBadge } from '../../ui/uni-badge';
import { metaUniversidad } from '../../core/universidades';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, UniBadge],
  template: `
    <header class="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-line">
      <div class="max-w-[1200px] mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <a routerLink="/" class="flex items-center gap-2 no-underline text-ink font-display font-bold text-xl">
          <img src="logo-quesale-naranja.png" alt="" class="h-9 w-9 object-contain" /> ¿Qué sale?
        </a>
        <nav class="hidden lg:flex items-center gap-6 text-sm font-semibold" aria-label="Secciones">
          @for (s of secciones; track s.id) {
            <a [href]="'#' + s.id" class="text-muted hover:text-ink no-underline">{{ s.texto }}</a>
          }
        </nav>
        <nav class="flex items-center gap-2" aria-label="Acceso">
          <a routerLink="/acceso" class="btn btn-ghost !min-h-10">Iniciar sesión</a>
          <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-10 hidden sm:inline-flex">Crear cuenta</a>
        </nav>
      </div>
    </header>

    <main>
      <section
        id="inicio"
        class="bg-[radial-gradient(900px_420px_at_85%_-10%,rgb(184_65_0/0.09),transparent_60%),radial-gradient(700px_380px_at_10%_0%,rgb(23_43_77/0.05),transparent_60%)]"
      >
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-ink mb-4">Por y para estudiantes universitarios</p>
            <h1 class="font-display font-extrabold text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] m-0 text-ink">Estudiar, conocerse…<br /><span class="text-brand">o lo que salga.</span></h1>
            <p class="text-muted text-lg mt-5 mb-8 max-w-xl leading-relaxed">Conecta con estudiantes que comparten tus gustos e intereses y convierte esa afinidad en un plan: estudiar, salir o conocerse mejor.</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn btn-primary !min-h-12 !text-base">Crear mi cuenta</a>
              <a href="#como" class="btn btn-ghost !min-h-12 !text-base">Cómo funciona</a>
            </div>
            <p class="text-xs text-muted mt-4 mb-0 flex items-center gap-1.5"><span class="icon !text-[16px] text-ok icon-fill">verified_user</span> Cuenta verificada con tu correo universitario</p>
          </div>

          <div class="relative mx-auto w-full max-w-sm lg:max-w-md pt-6" aria-hidden="true">
            <div class="absolute inset-x-8 top-0 bottom-10 rounded-[1.25rem] bg-white border border-line rotate-[-6deg]"></div>
            <div class="absolute inset-x-4 top-3 bottom-5 rounded-[1.25rem] bg-white border border-line rotate-[-3deg]"></div>
            <div class="card relative p-5 sm:p-6 shadow-xl">
              <div class="flex items-start gap-4">
                <app-avatar genero="FEMALE" nombre="Camila" [tam]="72" />
                <div class="min-w-0 flex-1">
                  <p class="m-0 font-display font-bold text-xl">Camila R.</p>
                  <p class="m-0 text-sm text-muted">Ing. de Sistemas · Ciclo 7 · Lima Centro</p>
                </div>
              </div>
              <div class="mt-5 rounded-xl bg-brand-soft p-4">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-bold uppercase tracking-wider text-muted">Afinidad</span>
                  <span class="font-display font-extrabold text-2xl text-brand leading-none">82%</span>
                </div>
                <div class="h-2 rounded-full bg-white mt-2 overflow-hidden"><div class="h-full w-[82%] rounded-full bg-brand"></div></div>
                <p class="text-xs text-muted mt-2 mb-0">Coinciden: Base de datos · Ciclo 7 · Sede Lima Centro</p>
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="chip chip-on">Base de datos</span><span class="chip">Backend</span><span class="chip">Vóley</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problema" class="scroll-mt-16 bg-white border-y border-line">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">El problema</h2>
          <p class="text-muted text-center max-w-2xl mx-auto mt-3 mb-10">Armar un grupo de estudio hoy depende de a quién ya conoces. Si no conoces a nadie, no armas nada.</p>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (p of problemas; track p.n) {
              <article class="rounded-[14px] border border-line bg-canvas p-5">
                <span class="font-display font-bold text-sm text-brand">{{ p.n }}</span>
                <h3 class="text-base font-semibold mt-2 mb-2">{{ p.titulo }}</h3>
                <p class="text-sm text-muted m-0 leading-relaxed">{{ p.texto }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section id="proposito" class="scroll-mt-16">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0 mb-10">Nuestro propósito</h2>
          <div class="grid md:grid-cols-2 gap-4 sm:gap-6">
            @for (p of proposito; track p.etiqueta) {
              <article class="card p-6 sm:p-8">
                <span class="inline-block rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-wider px-3 py-1">{{ p.etiqueta }}</span>
                <p class="text-muted mt-4 mb-0 leading-relaxed">{{ p.texto }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section id="valor" class="scroll-mt-16 bg-white border-y border-line">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">Propuesta de valor</h2>
          <p class="text-muted text-center max-w-2xl mx-auto mt-3 mb-10">Afinidad, comunidad universitaria y planes reales en un mismo lugar.</p>
          <div class="grid md:grid-cols-3 gap-4 sm:gap-6">
            @for (v of valores; track v.titulo) {
              <article class="rounded-[14px] border border-line bg-canvas p-6">
                <span class="inline-flex w-11 h-11 rounded-xl bg-brand-soft text-brand items-center justify-center"><span class="icon icon-fill">{{ v.icono }}</span></span>
                <h3 class="font-display text-lg font-bold mt-4 mb-2">{{ v.titulo }}</h3>
                <p class="text-sm text-muted m-0 leading-relaxed">{{ v.texto }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section id="como" class="scroll-mt-16">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">Cómo funciona</h2>
          <p class="text-muted text-center mt-3 mb-10">Tres pasos. Nada más.</p>
          <ol class="list-none m-0 p-0 grid md:grid-cols-3 gap-4 sm:gap-6">
            @for (paso of pasos; track paso.n) {
              <li class="card p-6">
                <span class="inline-flex w-10 h-10 rounded-full bg-brand text-white font-display font-bold items-center justify-center">{{ paso.n }}</span>
                <h3 class="font-display text-lg font-bold mt-4 mb-2">{{ paso.titulo }}</h3>
                <p class="text-muted m-0 leading-relaxed">{{ paso.texto }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <section id="universidades" class="scroll-mt-16 bg-white border-y border-line">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">Universidades de la red</h2>
          <p class="text-muted text-center max-w-2xl mx-auto mt-3 mb-10">Cada cuenta pertenece a una universidad y solo descubre estudiantes, planes y comunidades de la suya. Se verifica con el correo institucional.</p>
          <ul class="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            @for (u of universidades; track u.dominio) {
              <li class="rounded-[14px] border border-line bg-canvas p-4 flex flex-col items-center gap-3 text-center">
                @if (u.meta.logo) {
                  <span class="flex h-16 w-full items-center justify-center rounded-xl bg-white border border-line px-3 py-2">
                    <img [src]="u.meta.logo" [alt]="u.meta.nombre" class="max-h-full max-w-full object-contain" loading="lazy" />
                  </span>
                } @else {
                  <app-uni-badge [dominio]="u.dominio" [tam]="64" />
                }
                <span class="text-xs font-bold text-muted leading-tight">{{ u.nombre }}</span>
              </li>
            }
          </ul>
          <p class="text-[11px] text-muted text-center mt-6 mb-0 max-w-3xl mx-auto">Logos tomados de Wikimedia Commons; son marcas de cada universidad. Los de UTEC, PUCP, USIL y San Marcos se usan bajo licencia CC BY-SA. Proyecto académico: no está afiliado ni respaldado por ninguna universidad.</p>
        </div>
      </section>

      <section id="equipo" class="scroll-mt-16">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-center m-0">El equipo</h2>
          <p class="text-muted text-center max-w-2xl mx-auto mt-3 mb-10">Proyecto del curso Desarrollo Web Integrado · Ciclo VII · Universidad Tecnológica del Perú · 2026</p>
          <ul class="list-none m-0 p-0 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            @for (m of equipo; track m.iniciales) {
              <li class="card p-4 flex items-center gap-3">
                <span class="inline-flex w-10 h-10 rounded-full bg-ink text-white text-sm font-bold items-center justify-center shrink-0">{{ m.iniciales }}</span>
                <strong class="text-sm font-semibold leading-tight">{{ m.nombre }}</strong>
              </li>
            }
          </ul>
          <p class="text-center text-sm text-muted mt-6 mb-0">Docente: <strong class="text-ink">Iván Robles Fernández</strong></p>
        </div>
      </section>

      <section class="px-4 sm:px-6 pb-14">
        <div class="max-w-[1200px] mx-auto rounded-3xl bg-brand text-white p-8 sm:p-12 text-center">
          <h2 class="font-display text-3xl sm:text-4xl font-bold m-0 text-white">¿Qué sale hoy?</h2>
          <p class="text-white/85 mt-3 mb-6">Crea tu cuenta en un minuto y encuentra a tu gente.</p>
          <a routerLink="/acceso" [queryParams]="{ modo: 'registro' }" class="btn !min-h-12 !text-base bg-white text-brand hover:bg-brand-soft">Empezar ahora</a>
        </div>
      </section>
    </main>

    <footer class="bg-ink text-white">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-2 text-center">
        <span class="font-display font-bold text-lg">¿Qué sale?</span>
        <p class="text-sm text-white/75 m-0">Sistema de Conexión y Organización de Meetups Académicos y Sociales para Estudiantes Universitarios</p>
        <small class="text-xs text-white/60">Proyecto académico · UTP · 2026</small>
      </div>
    </footer>
  `,
})
export class Landing {
  protected readonly secciones = [
    { id: 'proposito', texto: 'Propósito' },
    { id: 'valor', texto: 'Propuesta de valor' },
    { id: 'como', texto: 'Cómo funciona' },
    { id: 'universidades', texto: 'Universidades' },
    { id: 'equipo', texto: 'Equipo' },
  ];

  protected readonly problemas = [
    { n: '01', titulo: 'Todo vive en el grupo de WhatsApp', texto: 'La información se pierde entre cientos de mensajes y nadie encuentra nada dos días después.' },
    { n: '02', titulo: 'No sabes quién es quién', texto: 'No hay forma de filtrar por carrera, ciclo, sede o curso. Solo nombres sueltos.' },
    { n: '03', titulo: 'Los de primeros ciclos quedan fuera', texto: 'Sin contactos previos, integrarse depende de la suerte.' },
    { n: '04', titulo: 'Nadie modera', texto: 'Las redes generales no tienen control institucional ni forma real de reportar.' },
  ];

  protected readonly proposito = [
    {
      etiqueta: 'Misión',
      texto: 'Conectar a los estudiantes universitarios con las personas adecuadas para estudiar, colaborar y compartir, dentro de un espacio verificado, organizado y moderado, donde cada coincidencia pueda convertirse en un encuentro real.',
    },
    {
      etiqueta: 'Visión',
      texto: 'Ser la plataforma de referencia de la vida universitaria en el Perú: el primer lugar al que entra un estudiante cuando necesita a alguien con quien estudiar, o algo que hacer el viernes.',
    },
  ];

  protected readonly valores = [
    { icono: 'favorite', titulo: 'Afinidad que se explica', texto: 'Debajo de cada coincidencia decimos qué tienen en común: carrera, ciclo, sede e intereses. Alta afinidad no abre un chat por sí sola.' },
    { icono: 'event_available', titulo: 'Del match al plan real', texto: 'Cuando los dos aceptan conectar pueden conversar y organizar un plan para dos o un meetup grupal, con fecha, lugar y cupos.' },
    { icono: 'shield', titulo: 'Comunidad universitaria, con reglas', texto: 'Se entra con correo institucional verificado, sin mostrar tu correo, y con bloqueo y reportes siempre disponibles.' },
  ];

  protected readonly pasos = [
    { n: 1, titulo: 'Verifica y arma tu perfil', texto: 'Elige tu universidad, verifica tu correo institucional y cuenta tu carrera, ciclo, sede e intereses.' },
    { n: 2, titulo: 'Descubre y conecta', texto: 'Te mostramos estudiantes afines con el motivo de la coincidencia. Envías una solicitud y la otra persona acepta.' },
    { n: 3, titulo: 'Crea o únete a un plan', texto: 'Repasar para el parcial, un café o un partido de vóley. Planes para dos, meetups grupales y comunidades por interés.' },
  ];

  protected readonly universidades = [
    { dominio: 'utp.edu.pe', nombre: 'UTP' },
    { dominio: 'upc.edu.pe', nombre: 'UPC' },
    { dominio: 'utec.edu.pe', nombre: 'UTEC' },
    { dominio: 'aloe.ulima.edu.pe', nombre: 'Universidad de Lima' },
    { dominio: 'usil.pe', nombre: 'USIL' },
    { dominio: 'upn.edu.pe', nombre: 'UPN' },
    { dominio: 'pucp.edu.pe', nombre: 'PUCP' },
    { dominio: 'ucvvirtual.edu.pe', nombre: 'Universidad César Vallejo' },
    { dominio: 'unmsm.edu.pe', nombre: 'San Marcos' },
  ].map((u) => ({ ...u, meta: metaUniversidad(u.dominio) }));

  protected readonly equipo = [
    { iniciales: 'EO', nombre: 'Espinoza Ortiz, John Andre' },
    { iniciales: 'LV', nombre: 'Licas Velasquez, María Fernanda' },
    { iniciales: 'EC', nombre: 'Espinoza Cermeño, Jesús Fernando' },
    { iniciales: 'ES', nombre: 'Escobedo Salazar, Bruno Fernando' },
    { iniciales: 'PA', nombre: 'Paez Alvarado, Ubes Manuel' },
  ];
}
