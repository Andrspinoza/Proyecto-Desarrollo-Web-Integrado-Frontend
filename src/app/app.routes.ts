import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'acceso',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/acceso/acceso').then((m) => m.Acceso),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', loadComponent: () => import('./pages/inicio/panel-real').then((m) => m.PanelReal) },
      { path: 'conexiones', loadComponent: () => import('./pages/conexiones/conexiones').then((m) => m.ConexionesReales) },
      { path: 'comunidades', loadComponent: () => import('./pages/comunidades/comunidades').then((m) => m.Comunidades) },
    ],
  },
  { path: '**', redirectTo: '' },
];
