import { TestBed } from '@angular/core/testing';
import { PERIODONTOGRAMA_EJEMPLO } from './datos-ejemplo';
import { Cara, Periodontograma } from './diagnostico.models';
import { DiagnosticoService, calcularResumen, generarOrientacion } from './diagnostico.service';

function todosLosSitiosIguales(profundidad: number, sangrado: boolean): Periodontograma {
  const dientes = PERIODONTOGRAMA_EJEMPLO.dientes.map((d) => {
    const cara: Cara = [
      { profundidad, sangrado },
      { profundidad, sangrado },
      { profundidad, sangrado },
    ];
    return {
      numero: d.numero,
      vestibular: d.vestibular ? cara : null,
      palatinoLingual: d.palatinoLingual ? cara : null,
    };
  });
  return { ...PERIODONTOGRAMA_EJEMPLO, dientes };
}

describe('DiagnosticoService', () => {
  let service: DiagnosticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagnosticoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empieza con el paciente de ejemplo', () => {
    expect(service.periodontograma().historiaClinica).toBe('HC-0142');
    expect(service.resumen().sitiosRegistrados).toBe(165);
  });

  it('recalcula todo cuando se cargan datos nuevos', () => {
    service.cargar(todosLosSitiosIguales(2, false));
    expect(service.resumen().sitios4mm).toBe(0);
    expect(service.orientacion().titulo).toBe(
      'Sangrado al sondaje bajo y sin bolsas de 4 mm o más',
    );
  });
});

describe('calcularResumen', () => {
  const resumen = calcularResumen(PERIODONTOGRAMA_EJEMPLO);

  it('cuenta los sitios registrados del paciente de ejemplo', () => {
    expect(resumen.sitiosPosibles).toBe(192);
    expect(resumen.sitiosRegistrados).toBe(165);
    expect(Math.round(resumen.porcentajeRegistro)).toBe(86);
  });

  it('calcula profundidad, sangrado y sitios ≥ 4 mm', () => {
    expect(resumen.profundidadPromedio.toFixed(1)).toBe('2.4');
    expect(resumen.sitiosConSangrado).toBe(28);
    expect(Math.round(resumen.porcentajeSangrado)).toBe(17);
    expect(resumen.sitios4mm).toBe(27);
  });

  it('encuentra los dientes afectados', () => {
    expect(resumen.dientesAfectados).toEqual([16, 17, 26, 36, 46, 47]);
    expect(resumen.dientesRegistrados).toBe(29);
  });

  it('calcula el promedio de cada cuadrante', () => {
    const promedios = resumen.cuadrantes.map((c) => c.profundidadPromedio.toFixed(1));
    expect(promedios).toEqual(['2.4', '2.4', '2.3', '2.4']);
  });
});

describe('generarOrientacion', () => {
  it('ejemplo: inflamación localizada con bolsas en molares', () => {
    const o = generarOrientacion(calcularResumen(PERIODONTOGRAMA_EJEMPLO));
    expect(o.titulo).toBe('Inflamación gingival localizada con bolsas localizadas en molares');
  });

  it('sangrado > 30 % y bolsas en todos los dientes: generalizada', () => {
    const o = generarOrientacion(calcularResumen(todosLosSitiosIguales(5, true)));
    expect(o.titulo).toBe('Inflamación gingival generalizada con bolsas generalizadas');
  });

  it('sin datos registrados', () => {
    const vacio = { ...PERIODONTOGRAMA_EJEMPLO, dientes: [] };
    expect(generarOrientacion(calcularResumen(vacio)).titulo).toBe('Aún no hay sitios registrados');
  });
});
