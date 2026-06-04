import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.default),
  },
  {
    path: 'movimentacoes',
    loadComponent: () => import('./pages/movimentacoes/movimentacoes').then((m) => m.default),
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/portfolio').then((m) => m.default),
  },
  {
    path: 'relatorios',
    loadComponent: () => import('./pages/relatorios/relatorios').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
