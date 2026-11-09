import { Routes } from '@angular/router';
import { Placeholder } from './placeholder/placeholder';

export const routes: Routes = [
  { path: '', component: Placeholder },
  { path: 'registro', component: Placeholder },
  {
    path: 'diagnostico',
    loadComponent: () => import('./diagnostico/diagnostico').then((m) => m.Diagnostico),
  },
  { path: 'recomendaciones', component: Placeholder },
  { path: 'historial', component: Placeholder },
];
