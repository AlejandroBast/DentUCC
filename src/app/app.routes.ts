import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Recomendaciones } from './recomendacionespage/recomendaciones';
import { Demo } from './demo/demo';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'registro', component: Demo },
  {
    path: 'diagnostico',
    loadComponent: () => import('./diagnostico/diagnostico').then((m) => m.Diagnostico),
  },
  { path: 'recomendaciones', component: Recomendaciones },
  {
    path: 'historial',
    loadComponent: () => import('./historial/historial').then((m) => m.Historial),
  },
];
