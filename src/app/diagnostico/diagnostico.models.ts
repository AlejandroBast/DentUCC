export interface Sitio {
  profundidad: number;
  sangrado: boolean;
}

export type Cara = [Sitio, Sitio, Sitio];

export interface Diente {
  numero: number;
  vestibular: Cara | null;
  palatinoLingual: Cara | null;
}

export interface Periodontograma {
  paciente: string;
  historiaClinica: string;
  fecha: string;
  dientes: Diente[];
}

export type VistaCuadrante = 'profundidad' | 'sangrado' | 'sitios4mm';

export interface ResumenCuadrante {
  numero: 1 | 2 | 3 | 4;
  rango: string;
  sitios: number;
  profundidadPromedio: number;
  porcentajeSangrado: number;
  sitios4mm: number;
}

export interface ResumenDiagnostico {
  sitiosPosibles: number;
  sitiosRegistrados: number;
  porcentajeRegistro: number;
  profundidadPromedio: number;
  sitiosConSangrado: number;
  porcentajeSangrado: number;
  sitios4mm: number;
  porcentajeSitios4mm: number;
  profundidadMaxima: number;
  dientesRegistrados: number;
  dientesAfectados: number[];
  cuadrantes: ResumenCuadrante[];
}

export interface OrientacionEducativa {
  titulo: string;
  puntos: string[];
}
