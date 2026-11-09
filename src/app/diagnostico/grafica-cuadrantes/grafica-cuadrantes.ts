import { Component, computed, input, signal } from '@angular/core';
import { ResumenCuadrante, VistaCuadrante } from '../diagnostico.models';
import { UMBRAL_SANGRADO, formatear } from '../diagnostico.service';

const VISTAS = {
  profundidad: { subtitulo: 'Profundidad de sondaje promedio (mm)', paso: 1, minimo: 4 },
  sangrado: { subtitulo: 'Sitios con sangrado al sondaje (%)', paso: 10, minimo: 30 },
  sitios4mm: { subtitulo: 'Número de sitios con sondaje ≥ 4 mm', paso: 2, minimo: 4 },
};

@Component({
  imports: [],
  selector: 'app-grafica-cuadrantes',
  styleUrl: './grafica-cuadrantes.css',
  templateUrl: './grafica-cuadrantes.html',
})
export class GraficaCuadrantes {
  readonly cuadrantes = input.required<ResumenCuadrante[]>();

  readonly vista = signal<VistaCuadrante>('profundidad');

  readonly botones: { id: VistaCuadrante; texto: string }[] = [
    { id: 'profundidad', texto: 'Profundidad' },
    { id: 'sangrado', texto: 'Sangrado' },
    { id: 'sitios4mm', texto: 'Sitios ≥ 4 mm' },
  ];

  readonly grafica = computed(() => {
    const vista = this.vista();
    const config = VISTAS[vista];

    const valores = this.cuadrantes().map((c) => this.valorSegunVista(c, vista));

    const masAlto = Math.max(...valores);
    const tope = Math.ceil((masAlto * 1.15) / config.paso) * config.paso;
    const maximo = Math.max(config.minimo, tope);

    const lineas: number[] = [];
    for (let valor = maximo; valor >= 0; valor -= config.paso) {
      lineas.push(valor);
    }

    const barras = this.cuadrantes().map((c, i) => ({
      etiqueta: `Cuadrante ${c.numero}`,
      rango: c.rango,
      texto: this.textoSegunVista(valores[i], vista),
      altura: (valores[i] / maximo) * 100,
    }));

    let umbral: number | null = null;
    if (vista === 'sangrado') {
      umbral = (UMBRAL_SANGRADO / maximo) * 100;
    }

    return { subtitulo: config.subtitulo, maximo, lineas, barras, umbral };
  });

  private valorSegunVista(c: ResumenCuadrante, vista: VistaCuadrante): number {
    if (vista === 'sangrado') {
      return c.porcentajeSangrado;
    }
    if (vista === 'sitios4mm') {
      return c.sitios4mm;
    }
    return c.profundidadPromedio;
  }

  private textoSegunVista(valor: number, vista: VistaCuadrante): string {
    if (vista === 'sangrado') {
      return `${formatear(valor)} %`;
    }
    if (vista === 'sitios4mm') {
      return valor === 1 ? '1 sitio' : `${valor} sitios`;
    }
    return `${formatear(valor, 1)} mm`;
  }
}
