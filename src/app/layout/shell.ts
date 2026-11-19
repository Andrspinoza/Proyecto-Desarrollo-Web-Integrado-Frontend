import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly enlaces = [
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/conexiones', texto: 'Conexiones' },
    { ruta: '/comunidades', texto: 'Comunidades' },
  ];
  protected readonly iniciales = computed(() => {
    const usuario = this.auth.usuario();
    return usuario ? (usuario.nombres.charAt(0) + usuario.apellidos.charAt(0)).toUpperCase() : '';
  });

  protected salir(): void {
    this.auth.cerrarSesion();
  }
}
