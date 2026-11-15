import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type Estado = 'Completado' | 'En revisión' | 'Borrador';
type Filtro = 'Todos' | Estado;

interface Registro {
  id: string;
  fecha: string;
  paciente: string;
  historia: string;
  profesional: string;
  estado: Estado;
  profundidad: string;
  sangrado: string;
  nota: string;
}

@Component({
  selector: 'app-historial',
  imports: [RouterLink],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial {
  readonly filtro = signal<Filtro>('Todos');
  readonly seleccionado = signal('REG-0142');
  readonly filtros: Filtro[] = ['Todos', 'Completado', 'En revisión', 'Borrador'];
  readonly registros: Registro[] = [
    { id: 'REG-0142', fecha: '14 Nov 2026', paciente: 'Paciente de ejemplo', historia: 'HC-0142', profesional: 'Dra. Laura Gómez', estado: 'Completado', profundidad: '3.1 mm', sangrado: '18%', nota: 'Registro completo · orientación disponible' },
    { id: 'REG-0127', fecha: '07 Nov 2026', paciente: 'María Fernanda R.', historia: 'HC-0127', profesional: 'Dr. Carlos Rojas', estado: 'En revisión', profundidad: '2.7 mm', sangrado: '11%', nota: 'Pendiente validación clínica' },
    { id: 'REG-0119', fecha: '30 Oct 2026', paciente: 'Juan David M.', historia: 'HC-0119', profesional: 'Dra. Laura Gómez', estado: 'Completado', profundidad: '2.4 mm', sangrado: '7%', nota: 'Control periódico registrado' },
    { id: 'REG-0105', fecha: '23 Oct 2026', paciente: 'Ana Sofía P.', historia: 'HC-0105', profesional: 'Dr. Carlos Rojas', estado: 'Borrador', profundidad: '—', sangrado: '—', nota: 'Registro incompleto · faltan sitios' },
  ];
  readonly visibles = computed(() => this.filtro() === 'Todos' ? this.registros : this.registros.filter((registro) => registro.estado === this.filtro()));
  readonly registroSeleccionado = computed(() => this.registros.find((registro) => registro.id === this.seleccionado()) ?? this.registros[0]);

  filtrar(filtro: Filtro): void { this.filtro.set(filtro); }
  seleccionar(id: string): void { this.seleccionado.set(id); }
}
