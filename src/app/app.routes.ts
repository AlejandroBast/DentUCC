import { Routes } from '@angular/router';
import { Pagina } from './pagina/pagina';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Pagina },
  { path: 'registro', component: Pagina },
  { path: 'diagnostico', component: Pagina },
  { path: 'recomendaciones', component: Pagina },
  { path: 'historial', component: Pagina },
  { path: '**', redirectTo: 'inicio' },
];
