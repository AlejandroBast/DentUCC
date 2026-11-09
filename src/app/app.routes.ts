import { Routes } from '@angular/router';
import { Placeholder } from './placeholder/placeholder';
import { Inicio } from './inicio/inicio';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'registro', component: Placeholder },
  { path: 'diagnostico', component: Placeholder },
  { path: 'recomendaciones', component: Placeholder },
  { path: 'historial', component: Placeholder },
];
