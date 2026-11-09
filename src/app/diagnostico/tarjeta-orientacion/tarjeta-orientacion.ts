import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrientacionEducativa } from '../diagnostico.models';

@Component({
  imports: [RouterLink],
  selector: 'app-tarjeta-orientacion',
  styleUrl: './tarjeta-orientacion.css',
  templateUrl: './tarjeta-orientacion.html',
})
export class TarjetaOrientacion {
  readonly orientacion = input.required<OrientacionEducativa>();
}
