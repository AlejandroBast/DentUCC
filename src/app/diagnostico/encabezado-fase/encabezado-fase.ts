import { Component, input } from '@angular/core';

export interface PasoFase {
  numero: number;
  titulo: string;
  detalle: string;
  estado: 'hecho' | 'actual' | 'pendiente';
}

@Component({
  imports: [],
  selector: 'app-encabezado-fase',
  styleUrl: './encabezado-fase.css',
  templateUrl: './encabezado-fase.html',
})
export class EncabezadoFase {
  readonly fase = input.required<number>();
  readonly titulo = input.required<string>();
  readonly destacado = input.required<string>();
  readonly subtitulo = input('');
  readonly pasos = input.required<PasoFase[]>();
}
