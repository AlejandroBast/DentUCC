import { Component, computed, signal } from '@angular/core';

type Tipo = 'paciente' | 'repasar';
type Filtro = 'todas' | Tipo;
type Tono = 'rojo' | 'azul' | 'gris' | 'ambar';

interface Recomendacion {
  tipo: Tipo;
  icono: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  dato: string;
  tono: Tono;
  pendiente?: boolean;
}

@Component({
  selector: 'app-recomendaciones',
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.css',
})
export class Recomendaciones {
  // ===== Datos del paciente (luego vienen del backend) =====
  paciente = {
    nombre: 'Mario González Morales',
    historia: 'HC-0142',
    area: 'Odontología y Periodoncia',
  };

  // ===== Recomendaciones =====
  recomendaciones: Recomendacion[] = [
    {
      tipo: 'paciente', icono: 'pincel', etiqueta: 'Cepillado', tono: 'rojo',
      titulo: 'Técnica de Bass modificada',
      texto: 'Cepillo a 45° hacia el surco gingival, con movimientos vibratorios cortos. Insistir especialmente en las zonas que sangraron.',
      dato: '26 sitios sangrantes',
    },
    {
      tipo: 'paciente', icono: 'espacios', etiqueta: 'Espacios', tono: 'gris',
      titulo: 'Limpieza interdental diaria',
      texto: 'Cepillos interproximales o seda dental en los molares con bolsas periodontales de 4–5 mm para remoción de biopelícula.',
      dato: 'Dientes 16 · 17 · 26 · 36 · 46 · 47',
    },
    {
      tipo: 'paciente', icono: 'ojo', etiqueta: 'Biopelícula', tono: 'azul',
      titulo: 'Control con revelador',
      texto: 'Registra el índice y muestra al paciente con revelador de placa dónde se acumula la biopelícula para motivar su técnica.',
      dato: "Índice de O'Leary",
    },
    {
      tipo: 'repasar', icono: 'regla', etiqueta: 'NIC', tono: 'gris',
      titulo: 'Nivel de inserción clínica',
      texto: 'Registra el margen gingival respecto a la unión amelocementaria; sin NIC no puedes estadificar una periodontitis.',
      dato: 'Clasificación AAP / EFP 2017',
    },
    {
      tipo: 'repasar', icono: 'libro', etiqueta: 'Diagnóstico', tono: 'gris',
      titulo: 'Bolsa o pseudobolsa',
      texto: 'Repasa cómo diferenciar una bolsa verdadera de un agrandamiento gingival antes de interpretar sondajes de 4 mm.',
      dato: 'Sondajes de 4 mm: 19 sitios',
    },
    {
      tipo: 'repasar', icono: 'lista', etiqueta: 'Pendiente', tono: 'ambar', pendiente: true,
      titulo: 'Completa la ficha',
      texto: 'Faltan 27 sitios. Un registro completo hace más confiable el resumen y diagnósticos preventivos de la fase 2.',
      dato: '165 de 192 sitios',
    },
  ];

  // ===== Secciones y filtros =====
  secciones = [
    { tipo: 'paciente' as Tipo, titulo: 'Para el paciente', sub: 'guías prácticas', nota: 'Autocuidado y cepillado en casa', color: 'lima' },
    { tipo: 'repasar' as Tipo, titulo: 'Para repasar', sub: 'criterios diagnósticos', nota: 'Normativa de diagnóstico y estadificación', color: 'azul' },
  ];

  filtros: { id: Filtro; nombre: string }[] = [
    { id: 'todas', nombre: 'Todas' },
    { id: 'paciente', nombre: 'Para el paciente' },
    { id: 'repasar', nombre: 'Para repasar' },
  ];

  filtro = signal<Filtro>('todas');
  aviso = signal('');

  seccionesVisibles = computed(() =>
    this.secciones.filter(s => this.filtro() === 'todas' || s.tipo === this.filtro())
  );

  contar(f: Filtro): number {
    return this.recomendaciones.filter(r => f === 'todas' || r.tipo === f).length;
  }

  de(tipo: Tipo): Recomendacion[] {
    return this.recomendaciones.filter(r => r.tipo === tipo);
  }

  // ===== Acciones =====
  exportar(): void {
    window.print();
  }

  compartir(): void {
    const url = location.href;
    if (typeof navigator.share === 'function') {
      navigator.share({ title: 'Recomendaciones educativas', url }).catch(() => {});
    } else {
      this.copiarTexto(url, 'Enlace copiado');
    }
  }

  copiar(): void {
    const texto = this.recomendaciones.map(r => `• ${r.titulo}: ${r.texto}`).join('\n');
    this.copiarTexto(texto, 'Recomendaciones copiadas');
  }

  private copiarTexto(texto: string, mensaje: string): void {
    navigator.clipboard
      .writeText(texto)
      .then(() => this.avisar(mensaje))
      .catch(() => this.avisar('No se pudo copiar'));
  }

  private avisar(mensaje: string): void {
    this.aviso.set(mensaje);
    setTimeout(() => this.aviso.set(''), 2000);
  }
}
