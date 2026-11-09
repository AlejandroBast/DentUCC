import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PERIODONTOGRAMA_EJEMPLO } from '../datos-ejemplo';
import { calcularResumen } from '../diagnostico.service';
import { GraficaCuadrantes } from './grafica-cuadrantes';

describe('GraficaCuadrantes', () => {
  let component: GraficaCuadrantes;
  let fixture: ComponentFixture<GraficaCuadrantes>;
  let elemento: HTMLElement;

  function leerValores(): string[] {
    const textos: string[] = [];
    elemento.querySelectorAll('.grafica__valor').forEach((valor) => {
      textos.push(valor.textContent!.trim());
    });
    return textos;
  }

  async function clicEnBoton(texto: string) {
    elemento.querySelectorAll('button').forEach((boton) => {
      if (boton.textContent!.includes(texto)) {
        boton.click();
      }
    });
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficaCuadrantes],
    }).compileComponents();

    fixture = TestBed.createComponent(GraficaCuadrantes);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'cuadrantes',
      calcularResumen(PERIODONTOGRAMA_EJEMPLO).cuadrantes,
    );
    await fixture.whenStable();
    elemento = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('empieza mostrando la profundidad promedio de los 4 cuadrantes', () => {
    expect(elemento.querySelectorAll('.grafica__barra').length).toBe(4);
    expect(leerValores()).toEqual(['2,4 mm', '2,4 mm', '2,3 mm', '2,4 mm']);
  });

  it('cambia a sangrado y dibuja la línea del umbral', async () => {
    await clicEnBoton('Sangrado');
    expect(leerValores()[0]).toContain('21');
    expect(elemento.querySelector('.grafica__guia--umbral')).not.toBeNull();
  });

  it('cambia a sitios ≥ 4 mm', async () => {
    await clicEnBoton('Sitios');
    expect(leerValores()).toEqual(['8 sitios', '5 sitios', '6 sitios', '8 sitios']);
    expect(elemento.querySelector('.grafica__guia--umbral')).toBeNull();
  });
});
