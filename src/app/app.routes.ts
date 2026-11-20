import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, perfilGuard } from './core/guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [invitadoGuard], loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing) },
  { path: 'acceso', canActivate: [invitadoGuard], loadComponent: () => import('./pages/acceso/acceso').then((m) => m.Acceso) },
  { path: 'olvide', canActivate: [invitadoGuard], loadComponent: () => import('./pages/clave/olvide').then((m) => m.Olvide) },
  { path: 'restablecer', loadComponent: () => import('./pages/clave/restablecer').then((m) => m.Restablecer) },
  { path: 'verificar', loadComponent: () => import('./pages/clave/verificar').then((m) => m.Verificar) },
  { path: 'bienvenida', canActivate: [authGuard], loadComponent: () => import('./pages/bienvenida/bienvenida').then((m) => m.Bienvenida) },
  {
    path: '',
    component: Shell,
    canActivate: [perfilGuard],
    children: [
      { path: 'descubrir', loadComponent: () => import('./pages/descubrir/descubrir').then((m) => m.Descubrir) },
      { path: 'personas/:id', loadComponent: () => import('./pages/persona/persona').then((m) => m.Persona) },
      { path: 'conexiones', loadComponent: () => import('./pages/conexiones/conexiones').then((m) => m.Conexiones) },
      { path: 'mensajes', loadComponent: () => import('./pages/mensajes/mensajes').then((m) => m.Mensajes) },
      { path: 'planes', loadComponent: () => import('./pages/planes/planes').then((m) => m.Planes) },
      { path: 'comunidades', loadComponent: () => import('./pages/comunidades/comunidades').then((m) => m.Comunidades) },
      { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil) },
    ],
  },
  { path: '**', redirectTo: '' },
];
