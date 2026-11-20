import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Api } from '../core/api.service';
import { Avisos } from '../core/avisos.service';
import { AuthService } from '../core/auth.service';
import { PersonasService } from '../core/personas.service';
import { TiempoReal } from '../core/tiempo-real.service';
import { Avatar } from '../ui/avatar';
import { UniBadge } from '../ui/uni-badge';

interface Enlace {
  ruta: string;
  texto: string;
  icono: string;
}

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Avatar, UniBadge],
  template: `
    <header class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-line">
      <div class="h-14 lg:h-16 max-w-[1200px] mx-auto px-3 lg:px-6 flex items-center gap-2 lg:gap-6">
        <button type="button" class="lg:hidden btn btn-ghost !min-h-10 !w-10 !px-0" aria-label="Abrir menú" [attr.aria-expanded]="menuAbierto()" (click)="menuAbierto.set(true)">
          <span class="icon">menu</span>
        </button>
        <a routerLink="/descubrir" class="flex items-center gap-2 no-underline text-brand font-display font-bold text-xl shrink-0">
          <img src="logo-quesale-naranja.png" alt="" class="h-8 w-8 object-contain" />
          <span>¿Qué sale?</span>
        </a>

        <form class="hidden md:flex flex-1 max-w-sm relative" role="search" (submit)="buscar($event)">
          <span class="icon absolute left-3 top-1/2 -translate-y-1/2 text-muted !text-[20px]">search</span>
          <input name="q" type="search" class="field !min-h-10 !pl-10 !rounded-full !bg-[#f5f3f8] !border-transparent" placeholder="Buscar estudiantes de tu universidad" [value]="texto()" (input)="texto.set($any($event.target).value)" aria-label="Buscar estudiantes" />
        </form>

        <nav class="hidden lg:flex items-center gap-1 ml-auto" aria-label="Principal">
          @for (e of enlaces; track e.ruta) {
            <a [routerLink]="e.ruta" routerLinkActive="!text-brand !bg-brand-soft" class="relative flex items-center gap-2 px-3 h-10 rounded-full text-sm font-bold text-muted no-underline hover:bg-[#f5f3f8]">
              <span class="icon !text-[20px]">{{ e.icono }}</span>{{ e.texto }}
              @if (e.ruta === '/conexiones' && pendientes() > 0) { <span class="min-w-5 h-5 px-1 rounded-full bg-brand text-white text-[11px] flex items-center justify-center">{{ pendientes() }}</span> }
              @if (e.ruta === '/mensajes' && sinLeer() > 0) { <span class="min-w-5 h-5 px-1 rounded-full bg-brand text-white text-[11px] flex items-center justify-center">{{ sinLeer() }}</span> }
            </a>
          }
        </nav>

        <div class="flex items-center gap-1 lg:gap-2 ml-auto lg:ml-0">
          <a routerLink="/conexiones" class="relative btn btn-ghost !min-h-10 !w-10 !px-0 lg:!hidden" aria-label="Solicitudes de conexión">
            <span class="icon">notifications</span>
            @if (pendientes() + sinLeer() > 0) { <span class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand text-white text-[11px] flex items-center justify-center">{{ pendientes() + sinLeer() }}</span> }
          </a>
          <a routerLink="/perfil" class="hidden lg:flex items-center gap-2 no-underline rounded-full pl-1 pr-3 h-11 hover:bg-[#f5f3f8]" aria-label="Mi perfil">
            <app-avatar [foto]="auth.yo()?.photoUrl ?? null" [genero]="auth.yo()?.profile?.gender ?? null" [nombre]="auth.nombre()" [tam]="36" />
            <span class="text-sm font-bold text-ink">{{ auth.nombre() }}</span>
          </a>
        </div>
      </div>
    </header>

    @if (menuAbierto()) {
      <div class="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
        <button type="button" class="absolute inset-0 bg-[#172b4d]/55 border-0" aria-label="Cerrar menú" (click)="menuAbierto.set(false)"></button>
        <aside class="rise absolute left-0 top-0 bottom-0 w-[84%] max-w-[320px] bg-white shadow-2xl flex flex-col">
          <div class="p-5 bg-brand-soft border-b border-line">
            <div class="flex items-center gap-3">
              <app-avatar [foto]="auth.yo()?.photoUrl ?? null" [genero]="auth.yo()?.profile?.gender ?? null" [nombre]="auth.nombre()" [tam]="56" />
              <div class="min-w-0">
                <p class="m-0 font-display font-bold text-lg leading-tight truncate">{{ auth.yo()?.firstName }} {{ auth.yo()?.lastName }}</p>
                <p class="m-0 text-xs text-muted truncate">{{ auth.yo()?.profile?.career }} · ciclo {{ auth.yo()?.profile?.cycle }}</p>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-2 text-xs font-bold text-muted">
              <app-uni-badge [dominio]="auth.universidad()?.emailDomain ?? null" [tam]="28" />
              <span class="truncate">{{ auth.universidad()?.name }}</span>
            </div>
          </div>
          <nav class="flex-1 overflow-y-auto p-3" aria-label="Menú móvil">
            @for (e of menuMovil(); track e.ruta) {
              <a [routerLink]="e.ruta" routerLinkActive="!bg-brand-soft !text-brand" class="flex items-center gap-3 px-4 h-12 rounded-xl text-[15px] font-bold text-ink no-underline hover:bg-[#f5f3f8]">
                <span class="icon">{{ e.icono }}</span>{{ e.texto }}
              </a>
            }
          </nav>
          <div class="p-3 border-t border-line">
            <button type="button" class="btn btn-ghost w-full" (click)="salir()"><span class="icon">logout</span> Cerrar sesión</button>
          </div>
        </aside>
      </div>
    }

    <main class="pt-14 lg:pt-16 pb-24 lg:pb-10 min-h-dvh">
      <div class="max-w-[1200px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <router-outlet />
      </div>
    </main>

    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Navegación inferior">
      <div class="grid grid-cols-5 h-16 max-w-xl mx-auto">
        @for (e of barraInferior; track e.ruta) {
          <a [routerLink]="e.ruta" routerLinkActive="!text-brand" class="relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold text-muted no-underline">
            <span class="icon">{{ e.icono }}</span>{{ e.texto }}
            @if (e.ruta === '/conexiones' && pendientes() > 0) { <span class="absolute top-1.5 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-brand text-white text-[10px] flex items-center justify-center">{{ pendientes() }}</span> }
            @if (e.ruta === '/mensajes' && sinLeer() > 0) { <span class="absolute top-1.5 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-brand text-white text-[10px] flex items-center justify-center">{{ sinLeer() }}</span> }
          </a>
        }
      </div>
    </nav>
  `,
})
export class Shell implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly avisos = inject(Avisos);
  private readonly personas = inject(PersonasService);
  private readonly tiempoReal = inject(TiempoReal);
  private readonly destruir = inject(DestroyRef);

  protected readonly menuAbierto = signal(false);
  protected readonly texto = signal('');
  protected readonly pendientes = signal(0);
  protected readonly sinLeer = signal(0);
  protected readonly enMensajes = signal(false);

  protected readonly enlaces: Enlace[] = [
    { ruta: '/descubrir', texto: 'Descubrir', icono: 'explore' },
    { ruta: '/conexiones', texto: 'Conexiones', icono: 'group' },
    { ruta: '/mensajes', texto: 'Mensajes', icono: 'chat_bubble' },
    { ruta: '/planes', texto: 'Planes', icono: 'event' },
    { ruta: '/comunidades', texto: 'Comunidades', icono: 'diversity_3' },
  ];
  protected readonly barraInferior: Enlace[] = [
    { ruta: '/descubrir', texto: 'Descubrir', icono: 'explore' },
    { ruta: '/conexiones', texto: 'Conexiones', icono: 'group' },
    { ruta: '/mensajes', texto: 'Mensajes', icono: 'chat_bubble' },
    { ruta: '/planes', texto: 'Planes', icono: 'event' },
    { ruta: '/perfil', texto: 'Perfil', icono: 'person' },
  ];
  protected readonly menuMovil = computed<Enlace[]>(() => [...this.enlaces, { ruta: '/perfil', texto: 'Mi perfil', icono: 'person' }]);

  ngOnInit(): void {
    this.auth.cargarUniversidades().subscribe();
    const token = this.auth.token();
    if (token !== null) this.tiempoReal.conectar(token);
    this.actualizarPendientes();

    this.tiempoReal.matches.pipe(takeUntilDestroyed(this.destruir)).subscribe((aviso) => {
      this.actualizarPendientes();
      this.personas.cargar([aviso.matchedStudentId]).subscribe(() => {
        const persona = this.personas.de(aviso.matchedStudentId);
        this.avisos.celebrar({
          personaId: aviso.matchedStudentId,
          nombre: persona?.firstName ?? aviso.matchedFirstName ?? 'tu conexión',
          foto: persona?.photoUrl ?? null,
          genero: persona?.profile?.gender ?? null,
        });
      });
    });

    this.tiempoReal.mensajes.pipe(takeUntilDestroyed(this.destruir)).subscribe((mensaje) => {
      if (this.enMensajes()) return;
      this.sinLeer.update((n) => n + 1);
      this.personas.cargar([mensaje.senderId]).subscribe(() => this.avisos.info(`Nuevo mensaje de ${this.personas.nombre(mensaje.senderId)}`));
    });

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destruir)).subscribe((e) => {
      this.menuAbierto.set(false);
      const enMensajes = (e as NavigationEnd).urlAfterRedirects.startsWith('/mensajes');
      this.enMensajes.set(enMensajes);
      if (enMensajes) this.sinLeer.set(0);
      this.actualizarPendientes();
    });
  }

  @HostListener('document:keydown.escape')
  protected alEscape(): void {
    this.menuAbierto.set(false);
  }

  protected buscar(evento: Event): void {
    evento.preventDefault();
    const q = this.texto().trim();
    void this.router.navigate(['/descubrir'], { queryParams: q ? { q } : {} });
  }

  protected salir(): void {
    this.tiempoReal.desconectar();
    this.menuAbierto.set(false);
    this.auth.cerrarSesion();
  }

  private actualizarPendientes(): void {
    this.api.recibidas().subscribe({ next: (lista) => this.pendientes.set(lista.length), error: () => undefined });
  }
}
