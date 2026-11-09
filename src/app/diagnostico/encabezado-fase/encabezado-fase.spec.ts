import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncabezadoFase, PasoFase } from './encabezado-fase';

describe('EncabezadoFase', () => {
  let component: EncabezadoFase;
  let fixture: ComponentFixture<EncabezadoFase>;
  let elemento: HTMLElement;

  const pasos: PasoFase[] = [
    { numero: 1, titulo: 'Registro por voz', detalle: 'Completado', estado: 'hecho' },
    { numero: 2, titulo: 'Orientación diagnóstica', detalle: 'En curso', estado: 'actual' },
    { numero: 3, titulo: 'Recomendaciones', detalle: 'Pendiente', estado: 'pendiente' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncabezadoFase],
    }).compileComponents();

    fixture = TestBed.createComponent(EncabezadoFase);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fase', 2);
    fixture.componentRef.setInput('titulo', 'Orientación');
    fixture.componentRef.setInput('destacado', 'diagnóstica');
    fixture.componentRef.setInput('subtitulo', 'Paciente de ejemplo');
    fixture.componentRef.setInput('pasos', pasos);
    await fixture.whenStable();
    elemento = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra la fase, el título y el subtítulo', () => {
    expect(elemento.querySelector('.encabezado-fase__fase')?.textContent).toContain('Fase 2');
    expect(elemento.querySelector('h1')?.textContent).toContain('Orientación');
    expect(elemento.querySelector('h1 strong')?.textContent).toContain('diagnóstica');
    expect(elemento.querySelector('.encabezado-fase__subtitulo')?.textContent).toContain(
      'Paciente de ejemplo',
    );
  });

  it('pinta los 3 pasos y marca el actual', () => {
    expect(elemento.querySelectorAll('.encabezado-fase__paso').length).toBe(3);
    expect(elemento.querySelector('.encabezado-fase__paso--actual')?.textContent).toContain(
      'Orientación diagnóstica',
    );
    expect(elemento.querySelector('.encabezado-fase__paso--hecho svg')).not.toBeNull();
  });
});
