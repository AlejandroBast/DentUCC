import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavItem } from './nav-item/nav-item';
import { EnlaceNav } from './enlace-nav';

// Componente padre del menú
@Component({
  selector: 'app-navbar',
  imports: [NgClass, RouterLink, NavItem],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly enlaces = signal<EnlaceNav[]>([
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/registro', texto: 'Registro' },
    { ruta: '/diagnostico', texto: 'Diagnóstico' },
    { ruta: '/recomendaciones', texto: 'Recomendaciones' },
    { ruta: '/historial', texto: 'Historial' },
  ]);

  // Menú hamburguesa en celular
  protected readonly menuAbierto = signal(false);

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  // Se ejecuta cuando el hijo NavItem emite (seleccionado)
  alNavegar(_enlace: EnlaceNav): void {
    this.menuAbierto.set(false);
  }
}
