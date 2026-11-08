import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EnlaceNav } from '../enlace-nav';

// Componente hijo: una opción del menú. Recibe datos con input() y avisa al padre con output()
@Component({
  selector: 'app-nav-item',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.css',
})
export class NavItem {
  readonly enlace = input.required<EnlaceNav>();

  readonly seleccionado = output<EnlaceNav>();

  alSeleccionar(): void {
    this.seleccionado.emit(this.enlace());
  }
}
