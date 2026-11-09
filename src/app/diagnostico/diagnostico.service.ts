import { Service, computed, signal } from '@angular/core';
import { PERIODONTOGRAMA_EJEMPLO } from './datos-ejemplo';
import {
  Diente,
  OrientacionEducativa,
  Periodontograma,
  ResumenCuadrante,
  ResumenDiagnostico,
  Sitio,
} from './diagnostico.models';

export const BOLSA_MM = 4;
export const UMBRAL_SANGRADO = 10;
export const UMBRAL_GENERALIZADO = 30;

@Service()
export class DiagnosticoService {
  private periodontogramaActual = signal<Periodontograma>(PERIODONTOGRAMA_EJEMPLO);

  readonly periodontograma = this.periodontogramaActual.asReadonly();

  readonly resumen = computed(() => calcularResumen(this.periodontogramaActual()));
  readonly orientacion = computed(() => generarOrientacion(this.resumen()));

  cargar(periodontograma: Periodontograma): void {
    this.periodontogramaActual.set(periodontograma);
  }
}

function sitiosDelDiente(diente: Diente): Sitio[] {
  const sitios: Sitio[] = [];
  if (diente.vestibular) {
    sitios.push(...diente.vestibular);
  }
  if (diente.palatinoLingual) {
    sitios.push(...diente.palatinoLingual);
  }
  return sitios;
}

function porcentaje(parte: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (parte / total) * 100;
}

function promedioProfundidad(sitios: Sitio[]): number {
  if (sitios.length === 0) {
    return 0;
  }
  let suma = 0;
  for (const sitio of sitios) {
    suma += sitio.profundidad;
  }
  return suma / sitios.length;
}

function contarSangrado(sitios: Sitio[]): number {
  return sitios.filter((sitio) => sitio.sangrado).length;
}

function contarBolsas(sitios: Sitio[]): number {
  return sitios.filter((sitio) => sitio.profundidad >= BOLSA_MM).length;
}

function resumirCuadrante(
  dientes: Diente[],
  numero: 1 | 2 | 3 | 4,
  rango: string,
): ResumenCuadrante {
  const dientesDelCuadrante = dientes.filter((d) => Math.floor(d.numero / 10) === numero);
  const sitios = dientesDelCuadrante.flatMap(sitiosDelDiente);

  return {
    numero,
    rango,
    sitios: sitios.length,
    profundidadPromedio: promedioProfundidad(sitios),
    porcentajeSangrado: porcentaje(contarSangrado(sitios), sitios.length),
    sitios4mm: contarBolsas(sitios),
  };
}

export function calcularResumen(p: Periodontograma): ResumenDiagnostico {
  const sitios = p.dientes.flatMap(sitiosDelDiente);

  const dientesRegistrados = p.dientes.filter((d) => sitiosDelDiente(d).length > 0);

  const dientesAfectados = dientesRegistrados
    .filter((d) => contarBolsas(sitiosDelDiente(d)) > 0)
    .map((d) => d.numero)
    .sort((a, b) => a - b);

  const sitiosPosibles = p.dientes.length * 6;
  const sitiosConSangrado = contarSangrado(sitios);
  const sitios4mm = contarBolsas(sitios);

  let profundidadMaxima = 0;
  for (const sitio of sitios) {
    if (sitio.profundidad > profundidadMaxima) {
      profundidadMaxima = sitio.profundidad;
    }
  }

  return {
    sitiosPosibles,
    sitiosRegistrados: sitios.length,
    porcentajeRegistro: porcentaje(sitios.length, sitiosPosibles),
    profundidadPromedio: promedioProfundidad(sitios),
    sitiosConSangrado,
    porcentajeSangrado: porcentaje(sitiosConSangrado, sitios.length),
    sitios4mm,
    porcentajeSitios4mm: porcentaje(sitios4mm, sitios.length),
    profundidadMaxima,
    dientesRegistrados: dientesRegistrados.length,
    dientesAfectados,
    cuadrantes: [
      resumirCuadrante(p.dientes, 1, '18 – 11'),
      resumirCuadrante(p.dientes, 2, '21 – 28'),
      resumirCuadrante(p.dientes, 3, '31 – 38'),
      resumirCuadrante(p.dientes, 4, '48 – 41'),
    ],
  };
}

const NOTA_CLASIFICACION =
  'Para clasificar (AAP/EFP 2017) falta el nivel de inserción clínica y el análisis radiográfico.';

export function generarOrientacion(r: ResumenDiagnostico): OrientacionEducativa {
  if (r.sitiosRegistrados === 0) {
    return {
      titulo: 'Aún no hay sitios registrados',
      puntos: ['Dicta el periodontograma en la Fase 1 para ver la orientación.'],
    };
  }

  const sangrado = Math.round(r.porcentajeSangrado);
  const afectados = r.dientesAfectados;

  let inflamacion = '';
  let puntoSangrado = '';
  if (r.porcentajeSangrado < UMBRAL_SANGRADO) {
    inflamacion = 'Sangrado al sondaje bajo';
    puntoSangrado = `Sangrado al sondaje del ${sangrado} %, por debajo del 10 %.`;
  } else if (r.porcentajeSangrado <= UMBRAL_GENERALIZADO) {
    inflamacion = 'Inflamación gingival localizada';
    puntoSangrado = `Sangrado al sondaje del ${sangrado} %: entre el 10 % y el 30 %, rango localizado.`;
  } else {
    inflamacion = 'Inflamación gingival generalizada';
    puntoSangrado = `Sangrado al sondaje del ${sangrado} %, por encima del 30 %: rango generalizado.`;
  }

  if (afectados.length === 0) {
    return {
      titulo: `${inflamacion} y sin bolsas de 4 mm o más`,
      puntos: [puntoSangrado, 'Ningún sitio con sondaje de 4 mm o más.', NOTA_CLASIFICACION],
    };
  }

  const esLocalizado = porcentaje(afectados.length, r.dientesRegistrados) < UMBRAL_GENERALIZADO;
  const patron = esLocalizado ? 'localizado' : 'generalizado';
  const bolsas = esLocalizado ? 'localizadas' : 'generalizadas';

  const soloMolares = afectados.every((n) => n % 10 >= 6);
  const molaresEIncisivos = afectados.every((n) => n % 10 >= 6 || n % 10 <= 2);

  let zona = '';
  if (soloMolares) {
    zona = ' en molares';
  } else if (molaresEIncisivos) {
    zona = ' en molares e incisivos';
  }

  let rangoMm = `${BOLSA_MM} mm`;
  if (r.profundidadMaxima > BOLSA_MM) {
    rangoMm = `${BOLSA_MM}–${r.profundidadMaxima} mm`;
  }

  const cantidad = afectados.length === 1 ? '1 diente' : `${afectados.length} dientes`;
  const todosMolares = soloMolares ? ', todos molares' : '';

  return {
    titulo: `${inflamacion} con bolsas ${bolsas}${zona}`,
    puntos: [
      puntoSangrado,
      `Bolsas de ${rangoMm} en ${cantidad}${todosMolares}: patrón ${patron}.`,
      NOTA_CLASIFICACION,
    ],
  };
}

export function formatear(valor: number, decimales = 0): string {
  return valor.toLocaleString('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}
