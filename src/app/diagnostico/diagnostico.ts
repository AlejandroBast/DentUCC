import { Component, computed, inject } from '@angular/core';
import { DiagnosticoService, formatear } from './diagnostico.service';
import { EncabezadoFase, PasoFase } from './encabezado-fase/encabezado-fase';
import { GraficaCuadrantes } from './grafica-cuadrantes/grafica-cuadrantes';
import { TarjetaOrientacion } from './tarjeta-orientacion/tarjeta-orientacion';

@Component({
  imports: [EncabezadoFase, GraficaCuadrantes, TarjetaOrientacion],
  selector: 'app-diagnostico',
  styleUrl: './diagnostico.css',
  templateUrl: './diagnostico.html',
})
export class Diagnostico {
  private readonly servicio = inject(DiagnosticoService);

  readonly paciente = this.servicio.periodontograma;
  readonly resumen = this.servicio.resumen;
  readonly orientacion = this.servicio.orientacion;
  readonly formatear = formatear;

  readonly subtitulo = computed(() => {
    const p = this.paciente();
    const r = this.resumen();
    return `${p.paciente} · ${p.historiaClinica} · ${r.sitiosRegistrados} sitios registrados de ${r.sitiosPosibles}`;
  });

  readonly pasos = computed<PasoFase[]>(() => {
    const registro = formatear(this.resumen().porcentajeRegistro);
    return [
      {
        numero: 1,
        titulo: 'Registro por voz',
        detalle: `Completado al ${registro} %`,
        estado: 'hecho',
      },
      { numero: 2, titulo: 'Orientación diagnóstica', detalle: 'En curso', estado: 'actual' },
      { numero: 3, titulo: 'Recomendaciones', detalle: 'Pendiente', estado: 'pendiente' },
    ];
  });
}
