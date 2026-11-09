import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Diagnostico } from './diagnostico';
import { DiagnosticoService } from './diagnostico.service';
import { PERIODONTOGRAMA_EJEMPLO } from './datos-ejemplo';

describe('Diagnostico', () => {
  let component: Diagnostico;
  let fixture: ComponentFixture<Diagnostico>;
  let elemento: HTMLElement;

  function leerValores(): string[] {
    const textos: string[] = [];
    elemento.querySelectorAll('.diagnostico__kpi-valor').forEach((valor) => {
      textos.push(valor.textContent!.replace(/\s+/g, ' ').trim());
    });
    return textos;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diagnostico],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Diagnostico);
    component = fixture.componentInstance;
    await fixture.whenStable();
    elemento = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra las 4 tarjetas de resumen del paciente de ejemplo', () => {
    expect(leerValores()).toEqual(['2,4 mm', '17 %', '6 de 29', '27 sitios']);
    expect(elemento.querySelectorAll('.diagnostico__chips li').length).toBe(6);
  });

  it('incluye el encabezado, la gráfica y la orientación', () => {
    expect(elemento.querySelector('app-encabezado-fase')?.textContent).toContain('HC-0142');
    expect(elemento.querySelector('app-grafica-cuadrantes')).not.toBeNull();
    expect(elemento.querySelector('app-tarjeta-orientacion')?.textContent).toContain(
      'Inflamación gingival localizada',
    );
  });

  it('se actualiza cuando el servicio recibe datos nuevos', async () => {
    const sinBolsas = {
      ...PERIODONTOGRAMA_EJEMPLO,
      dientes: PERIODONTOGRAMA_EJEMPLO.dientes.filter((d) => d.numero % 10 < 6),
    };
    TestBed.inject(DiagnosticoService).cargar(sinBolsas);
    await fixture.whenStable();
    expect(leerValores()[3]).toBe('0 sitios');
  });
});
