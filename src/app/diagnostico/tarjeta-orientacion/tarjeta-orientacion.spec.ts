import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TarjetaOrientacion } from './tarjeta-orientacion';

describe('TarjetaOrientacion', () => {
  let component: TarjetaOrientacion;
  let fixture: ComponentFixture<TarjetaOrientacion>;
  let elemento: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaOrientacion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaOrientacion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('orientacion', {
      titulo: 'Título de prueba',
      puntos: ['Punto uno', 'Punto dos'],
    });
    await fixture.whenStable();
    elemento = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el título y cada punto de la orientación', () => {
    expect(elemento.querySelector('h2')?.textContent).toContain('Título de prueba');
    expect(elemento.querySelectorAll('li').length).toBe(2);
  });

  it('tiene los enlaces a Registro y a Recomendaciones', () => {
    const enlaces = elemento.querySelectorAll('a');
    expect(enlaces[0].getAttribute('href')).toBe('/registro');
    expect(enlaces[1].getAttribute('href')).toBe('/recomendaciones');
  });
});
