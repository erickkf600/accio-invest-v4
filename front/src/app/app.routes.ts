import { Route } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.default),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.default),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.default),
  },
  {
    path: 'esqueci-senha',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/esqueci-senha/esqueci-senha').then((m) => m.default),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.default),
  },
  {
    path: 'movimentacoes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/movimentacoes/movimentacoes').then((m) => m.default),
  },
  {
    path: 'portfolio',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/portfolio/portfolio').then((m) => m.default),
  },
  {
    path: 'relatorios',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/relatorios/relatorios').then((m) => m.default),
  },
  {
    path: 'ferramentas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ferramentas/ferramentas').then((m) => m.default),
  },
  {
    path: 'meu-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/meu-perfil/meu-perfil').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
