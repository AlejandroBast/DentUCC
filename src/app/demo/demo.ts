import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type Cara = 'v' | 'p';
type Campo = 'mg' | 'ps';
type Fila = 'furca' | 'sangrado' | 'placa' | Campo;
type Cabecera = 'num' | 'imp' | 'mov';
type Arcada = 'sup' | 'inf';
type Tipo = 'incisivo' | 'canino' | 'premolar' | 'molar';
type Tono = 'ok' | 'ambar' | 'rojo' | '';

interface Sitios {
  sangrado: boolean[];
  placa: boolean[];
  /** Margen gingival (mm): negativo = recesión (apical a la LAC), positivo = coronal. */
  mg: (number | null)[];
  /** Profundidad de sondaje (mm). */
  ps: (number | null)[];
  /** Grados de furcación (0–3) de esta cara. Vacío si el diente no tiene furcación. */
  furca: number[];
}

interface Diente {
  n: number;
  tipo: Tipo;
  ancho: number;
  corona: string;
  raiz: string;
  fijacion: string;
  roscas: string;
  ausente: boolean;
  implante: boolean;
  movilidad: number;
  v: Sitios;
  p: Sitios;
}

interface Bloque {
  cara: Cara;
  titulo: string;
  raicesArriba: boolean;
  filas: Fila[];
}

interface ArcadaVista {
  id: Arcada;
  titulo: string;
  dientes: Diente[];
  cabecera: Cabecera[];
  bloques: Bloque[];
}

// ===== Geometría del gráfico =====
const COL = 62; // px por diente (igual que la columna de la tabla)
const S = 4.4; // px por milímetro
const ALTO = 150;
const CEJ_ARRIBA = 96; // raíces hacia arriba, corona abajo
const CEJ_ABAJO = 54; // raíces hacia abajo, corona arriba

// Medidas aproximadas (mm) por posición del diente (1–8)
const ANCHO: Record<Arcada, number[]> = {
  sup: [0, 8.5, 6.8, 7.6, 7, 6.8, 10.2, 9.2, 8.6],
  inf: [0, 5.4, 5.9, 6.9, 7, 7.1, 11, 10.4, 10],
};
const TIPO: Tipo[] = ['incisivo', 'incisivo', 'incisivo', 'canino', 'premolar', 'premolar', 'molar', 'molar', 'molar'];
const CORONA: Record<Tipo, number> = { incisivo: 10, canino: 10.5, premolar: 8.3, molar: 7.4 };
const RAIZ: Record<Tipo, number> = { incisivo: 13, canino: 16, premolar: 14, molar: 13 };

const r = (n: number) => Math.round(n * 100) / 100;
const pt = (x: number, y: number) => `${r(x)} ${r(y)}`;

/** Corona en coordenadas locales (mm): y=0 es la LAC, y>0 hacia oclusal. */
function corona(tipo: Tipo, w: number, ch: number): string {
  const a = w * 0.36;
  const b = w / 2;
  let oclusal: string;
  switch (tipo) {
    case 'incisivo':
      oclusal = `C${pt(-b, ch * 0.85)} ${pt(-b * 0.9, ch)} ${pt(-b * 0.72, ch)} L${pt(b * 0.72, ch)} C${pt(b * 0.9, ch)} ${pt(b, ch * 0.85)} ${pt(b, ch * 0.55)}`;
      break;
    case 'canino':
      oclusal = `C${pt(-b, ch * 0.78)} ${pt(-b * 0.45, ch * 0.88)} ${pt(0, ch * 1.04)} C${pt(b * 0.45, ch * 0.88)} ${pt(b, ch * 0.78)} ${pt(b, ch * 0.55)}`;
      break;
    case 'premolar':
      oclusal = `Q${pt(-b, ch)} ${pt(-b * 0.45, ch)} Q${pt(0, ch * 0.84)} ${pt(b * 0.45, ch)} Q${pt(b, ch)} ${pt(b, ch * 0.55)}`;
      break;
    default:
      oclusal = `Q${pt(-b, ch)} ${pt(-b * 0.6, ch)} Q${pt(-b * 0.3, ch * 0.85)} ${pt(0, ch)} Q${pt(b * 0.3, ch * 0.85)} ${pt(b * 0.6, ch)} Q${pt(b, ch)} ${pt(b, ch * 0.55)}`;
  }
  return `M${pt(-a, 0)} C${pt(-a * 1.05, ch * 0.25)} ${pt(-b, ch * 0.3)} ${pt(-b, ch * 0.55)} ${oclusal} C${pt(b, ch * 0.3)} ${pt(a * 1.05, ch * 0.25)} ${pt(a, 0)} Z`;
}

/** Raíz natural (y<0 hacia apical). */
function raiz(w: number, rl: number, raices: number): string {
  const a = w * 0.36;
  if (raices === 1) {
    return `M${pt(a, 0)} C${pt(a, -rl * 0.45)} ${pt(a * 0.45, -rl * 0.92)} ${pt(0, -rl)} C${pt(-a * 0.45, -rl * 0.92)} ${pt(-a, -rl * 0.45)} ${pt(-a, 0)} Z`;
  }
  return (
    `M${pt(a, 0)} C${pt(a * 1.05, -rl * 0.4)} ${pt(a * 0.85, -rl * 0.9)} ${pt(a * 0.55, -rl)} ` +
    `C${pt(a * 0.3, -rl * 0.98)} ${pt(a * 0.25, -rl * 0.6)} ${pt(0, -rl * 0.32)} ` +
    `C${pt(-a * 0.25, -rl * 0.6)} ${pt(-a * 0.3, -rl * 0.98)} ${pt(-a * 0.55, -rl)} ` +
    `C${pt(-a * 0.85, -rl * 0.9)} ${pt(-a * 1.05, -rl * 0.4)} ${pt(-a, 0)} Z`
  );
}

/** Implante: cuerpo cónico + roscas. */
function implante(w: number, rl: number): { cuerpo: string; roscas: string } {
  const f = Math.min(w * 0.36, 4.2) * 0.62;
  const L = Math.min(rl, 13) * 0.82;
  const cuerpo = `M${pt(-f, 0)} L${pt(f, 0)} L${pt(f * 0.85, -L * 0.85)} Q${pt(f * 0.7, -L)} ${pt(0, -L)} Q${pt(-f * 0.7, -L)} ${pt(-f * 0.85, -L * 0.85)} Z`;
  let roscas = '';
  for (let y = 1.4; y < L * 0.86; y += 1.3) roscas += `M${pt(-f * 0.95, -y)} L${pt(f * 0.95, -y - 0.5)} `;
  return { cuerpo, roscas };
}

function sitios(furcas: number): Sitios {
  return {
    sangrado: [false, false, false],
    placa: [false, false, false],
    mg: [null, null, null],
    ps: [null, null, null],
    furca: Array(furcas).fill(0),
  };
}

function crearDiente(n: number): Diente {
  const arcada: Arcada = n < 30 ? 'sup' : 'inf';
  const pos = n % 10;
  const tipo = TIPO[pos];
  const w = ANCHO[arcada][pos];
  const ch = CORONA[tipo] - (arcada === 'inf' && tipo === 'incisivo' ? 1 : 0);
  const rl = RAIZ[tipo] - (pos === 8 ? 2 : 0);
  const raices = tipo === 'molar' || (arcada === 'sup' && pos === 4) ? 2 : 1;
  const molar = tipo === 'molar';
  const imp = implante(w, rl);
  return {
    n,
    tipo,
    ancho: w,
    corona: corona(tipo, w, ch),
    raiz: raiz(w, rl, raices),
    fijacion: imp.cuerpo,
    roscas: imp.roscas,
    ausente: false,
    implante: false,
    movilidad: 0,
    // Molares: 1 furcación vestibular; superiores 2 palatinas (M/D), inferiores 1 lingual.
    v: sitios(molar ? 1 : 0),
    p: sitios(molar ? (arcada === 'sup' ? 2 : 1) : 0),
  };
}

@Component({
  selector: 'app-demo',
  imports: [NgTemplateOutlet],
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly COL = COL;
  protected readonly ALTO = ALTO;
  protected readonly ANCHO_SVG = COL * 16;
  protected readonly CEJ_ARRIBA = CEJ_ARRIBA;
  protected readonly CEJ_ABAJO = CEJ_ABAJO;
  protected readonly rejilla = Array.from({ length: 18 }, (_, i) => i + 1);

  // ===== Datos del examen =====
  paciente = '';
  historia = '';
  fecha = '';
  clinico = '';
  examen = signal<'inicial' | 'reevaluacion'>('inicial');

  // ===== Dientes (notación FDI) =====
  private readonly sup = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map(crearDiente);
  private readonly inf = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map(crearDiente);

  readonly arcadas: ArcadaVista[] = [
    {
      id: 'sup',
      titulo: 'Maxilar superior',
      dientes: this.sup,
      cabecera: ['num', 'imp', 'mov'],
      bloques: [
        { cara: 'v', titulo: 'Vestibular', raicesArriba: true, filas: ['furca', 'sangrado', 'placa', 'mg', 'ps'] },
        { cara: 'p', titulo: 'Palatino', raicesArriba: false, filas: ['ps', 'mg', 'placa', 'sangrado', 'furca'] },
      ],
    },
    {
      id: 'inf',
      titulo: 'Maxilar inferior',
      dientes: this.inf,
      cabecera: ['mov', 'imp', 'num'],
      bloques: [
        { cara: 'p', titulo: 'Lingual', raicesArriba: true, filas: ['furca', 'sangrado', 'placa', 'mg', 'ps'] },
        { cara: 'v', titulo: 'Vestibular', raicesArriba: false, filas: ['ps', 'mg', 'placa', 'sangrado', 'furca'] },
      ],
    },
  ];

  /** Se incrementa en cada cambio para recalcular los índices. */
  private readonly rev = signal(0);

  readonly indices = computed(() => {
    this.rev();
    let sitiosTotales = 0;
    let medidos = 0;
    let sumaPs = 0;
    let sumaNic = 0;
    let bop = 0;
    let pi = 0;
    let ps4 = 0;
    let ps6 = 0;
    let presentes = 0;
    let implantes = 0;

    for (const d of [...this.sup, ...this.inf]) {
      if (d.ausente) continue;
      presentes++;
      if (d.implante) implantes++;
      for (const s of [d.v, d.p]) {
        for (let k = 0; k < 3; k++) {
          sitiosTotales++;
          if (s.sangrado[k]) bop++;
          if (s.placa[k]) pi++;
          const ps = s.ps[k];
          if (ps === null) continue;
          medidos++;
          sumaPs += ps;
          sumaNic += ps - (s.mg[k] ?? 0);
          if (ps >= 4) ps4++;
          if (ps >= 6) ps6++;
        }
      }
    }

    const pct = (x: number) => (sitiosTotales ? Math.round((x / sitiosTotales) * 100) : 0);
    const prom = (x: number) => (medidos ? (x / medidos).toFixed(1) : '0.0');
    const tonoPct = (p: number): Tono => (p > 30 ? 'rojo' : p > 10 ? 'ambar' : 'ok');
    const bopPct = pct(bop);
    const piPct = pct(pi);

    return [
      { etq: 'Profundidad media', valor: prom(sumaPs), unidad: 'mm', tono: '' as Tono },
      { etq: 'Inserción media', valor: prom(sumaNic), unidad: 'mm', tono: '' as Tono },
      { etq: 'Sangrado (BOP)', valor: String(bopPct), unidad: '%', tono: tonoPct(bopPct) },
      { etq: 'Placa (PI)', valor: String(piPct), unidad: '%', tono: tonoPct(piPct) },
      { etq: 'Sitios PS ≥ 4 mm', valor: String(ps4), unidad: '', tono: (ps4 ? 'ambar' : 'ok') as Tono },
      { etq: 'Sitios PS ≥ 6 mm', valor: String(ps6), unidad: '', tono: (ps6 ? 'rojo' : 'ok') as Tono },
      { etq: 'Dientes / implantes', valor: `${presentes}`, unidad: `/ ${implantes}`, tono: '' as Tono },
    ];
  });

  // ===== Etiquetas =====
  etiqueta(f: Fila): string {
    return { furca: 'Furcación', sangrado: 'Sangrado', placa: 'Placa', mg: 'Margen gingival', ps: 'Prof. sondaje' }[f];
  }

  txt(v: number | null): string {
    return v === null ? '' : String(v);
  }

  nivel(v: number | null): string {
    if (v === null) return '';
    return v >= 6 ? 'alto' : v >= 4 ? 'medio' : '';
  }

  // ===== Gráfico =====
  transformar(i: number, cej: number, raicesArriba: boolean): string {
    return `translate(${i * COL + COL / 2} ${cej}) scale(${S} ${raicesArriba ? S : -S})`;
  }

  /** y en píxeles para una profundidad (mm) medida hacia apical desde la LAC. */
  y(cej: number, mm: number, raicesArriba: boolean): number {
    return r(raicesArriba ? cej - mm * S : cej + mm * S);
  }

  lineas(dientes: Diente[], cara: Cara, raicesArriba: boolean): { mg: string; ps: string; area: string } {
    this.rev();
    const cej = raicesArriba ? CEJ_ARRIBA : CEJ_ABAJO;
    let mg = '';
    let ps = '';
    let area = '';
    let segMg: string[] = [];
    let segPs: string[] = [];

    const cerrar = () => {
      if (segMg.length) {
        mg += `M${segMg.join('L')}`;
        ps += `M${segPs.join('L')}`;
        area += `M${[...segMg, ...segPs.slice().reverse()].join('L')}Z`;
      }
      segMg = [];
      segPs = [];
    };

    dientes.forEach((d, i) => {
      if (d.ausente) return cerrar();
      const s = d[cara];
      const cx = i * COL + COL / 2;
      for (let k = 0; k < 3; k++) {
        const x = cx + (k - 1) * d.ancho * 0.3 * S;
        const margen = -(s.mg[k] ?? 0); // profundidad apical del margen
        const fondo = margen + (s.ps[k] ?? 0);
        segMg.push(pt(x, this.y(cej, margen, raicesArriba)));
        segPs.push(pt(x, this.y(cej, fondo, raicesArriba)));
      }
    });
    cerrar();
    return { mg, ps, area };
  }

  // ===== Edición =====
  private tocar(): void {
    this.rev.update(v => v + 1);
  }

  alternarAusente(d: Diente): void {
    d.ausente = !d.ausente;
    this.tocar();
  }

  alternarImplante(d: Diente): void {
    d.implante = !d.implante;
    this.tocar();
  }

  ciclarMovilidad(d: Diente): void {
    d.movilidad = (d.movilidad + 1) % 4;
    this.tocar();
  }

  ciclarFurca(s: Sitios, k: number): void {
    s.furca[k] = (s.furca[k] + 1) % 4;
    this.tocar();
  }

  alternar(s: Sitios, campo: 'sangrado' | 'placa', k: number): void {
    s[campo][k] = !s[campo][k];
    this.tocar();
  }

  entrada(ev: Event, s: Sitios, campo: Campo, k: number): void {
    const el = ev.target as HTMLInputElement;
    let t = el.value.replace(/[^\d-]/g, '');
    if (campo === 'ps') t = t.replace(/-/g, '');

    if (t === '') {
      s[campo][k] = null;
      el.value = '';
      this.tocar();
      return;
    }
    if (t === '-') {
      el.value = '-';
      return;
    }
    if (!/^-?\d{1,2}$/.test(t)) {
      el.value = this.txt(s[campo][k]);
      return;
    }
    const v = Math.max(-15, Math.min(15, parseInt(t, 10)));
    s[campo][k] = v;
    el.value = String(v);
    this.tocar();
    // Un dígito = un sitio: salta al siguiente para registrar rápido.
    if (/^-?\d$/.test(t)) this.mover(el, 1);
  }

  tecla(ev: KeyboardEvent): void {
    const el = ev.target as HTMLInputElement;
    switch (ev.key) {
      case 'ArrowRight':
      case 'Enter':
        ev.preventDefault();
        this.mover(el, 1);
        break;
      case 'ArrowLeft':
        ev.preventDefault();
        this.mover(el, -1);
        break;
      case 'ArrowUp':
        ev.preventDefault();
        this.moverVertical(el, -1);
        break;
      case 'ArrowDown':
        ev.preventDefault();
        this.moverVertical(el, 1);
        break;
      case 'Backspace':
        if (el.value === '') {
          ev.preventDefault();
          this.mover(el, -1);
        }
        break;
    }
  }

  private mover(el: HTMLInputElement, dir: number): void {
    const fila = el.dataset['fila'];
    const todos = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLInputElement>(`input.valor[data-fila="${fila}"]:not(:disabled)`),
    );
    todos[todos.indexOf(el) + dir]?.focus();
  }

  private moverVertical(el: HTMLInputElement, dir: number): void {
    const { arcada, idx } = el.dataset;
    const columna = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLInputElement>(`input.valor[data-arcada="${arcada}"][data-idx="${idx}"]`),
    );
    columna[columna.indexOf(el) + dir]?.focus();
  }

  // ===== Acciones =====
  limpiar(): void {
    for (const d of [...this.sup, ...this.inf]) {
      d.ausente = false;
      d.implante = false;
      d.movilidad = 0;
      for (const s of [d.v, d.p]) {
        s.sangrado.fill(false);
        s.placa.fill(false);
        s.mg.fill(null);
        s.ps.fill(null);
        s.furca.fill(0);
      }
    }
    this.tocar();
  }

  /** Datos de ejemplo deterministas (periodontitis moderada localizada en molares). */
  cargarEjemplo(): void {
    this.limpiar();
    let semilla = 20251109;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    const todos = [...this.sup, ...this.inf];
    const buscar = (n: number) => todos.find(d => d.n === n)!;

    for (const d of todos) {
      const molar = d.tipo === 'molar';
      for (const cara of ['v', 'p'] as Cara[]) {
        const s = d[cara];
        for (let k = 0; k < 3; k++) {
          const interproximal = k !== 1;
          const base = 2 + (interproximal ? 1 : 0) + (molar ? 1 : 0);
          const ps = Math.max(1, Math.min(8, base + Math.round(azar() * 2.4 - 1.2)));
          s.ps[k] = ps;
          const incisivoInf = d.n > 30 && d.tipo === 'incisivo' && cara === 'v';
          s.mg[k] = incisivoInf ? -1 - Math.round(azar()) : azar() < 0.07 ? -1 : azar() < 0.05 ? 1 : 0;
          s.sangrado[k] = azar() < (ps >= 4 ? 0.6 : 0.12);
          s.placa[k] = azar() < 0.32;
        }
      }
    }

    buscar(18).ausente = true;
    buscar(38).ausente = true;
    const i36 = buscar(36);
    i36.implante = true;
    i36.v.ps = [3, 2, 3];
    i36.p.ps = [3, 2, 3];
    buscar(31).movilidad = 1;
    buscar(41).movilidad = 1;
    buscar(47).movilidad = 2;
    buscar(16).v.furca = [1];
    buscar(16).p.furca = [1, 0];
    buscar(26).v.furca = [2];
    buscar(26).p.furca = [0, 1];
    buscar(46).v.furca = [1];
    buscar(47).p.furca = [2];
    const d47 = buscar(47);
    d47.v.ps = [6, 4, 7];
    d47.p.ps = [6, 5, 6];
    this.tocar();
  }

  imprimir(): void {
    window.print();
  }

  valor(ev: Event): string {
    return (ev.target as HTMLInputElement).value;
  }
}
