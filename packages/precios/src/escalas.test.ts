import { describe, expect, it } from 'vitest';
import { ErrorDeValidacionDePrecios } from './errores';
import { obtenerEscalaParaCantidad, obtenerSiguienteEscala, validarEscalas } from './escalas';
import { EscalaPrecio } from './tipos';

const escalas: EscalaPrecio[] = [
  { id: 'e1', nombre: 'Lista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

describe('obtenerEscalaParaCantidad', () => {
  it.each([
    [1, 'e1'],
    [99, 'e1'],
    [100, 'e2'],
    [499, 'e2'],
    [500, 'e3'],
    [2000, 'e3'],
  ])('con %i unidades aplica la escala %s', (cantidad, idEsperado) => {
    expect(obtenerEscalaParaCantidad(escalas, cantidad)?.id).toBe(idEsperado);
  });

  it('devuelve null si el pedido no tiene unidades', () => {
    expect(obtenerEscalaParaCantidad(escalas, 0)).toBeNull();
  });

  it('funciona aunque las escalas lleguen desordenadas', () => {
    const desordenadas = [escalas[2], escalas[0], escalas[1]];
    expect(obtenerEscalaParaCantidad(desordenadas, 150)?.id).toBe('e2');
  });
});

describe('obtenerSiguienteEscala', () => {
  it('con 90 unidades la siguiente es la de 100', () => {
    expect(obtenerSiguienteEscala(escalas, 90)?.id).toBe('e2');
  });

  it('con 500 unidades no hay siguiente escala', () => {
    expect(obtenerSiguienteEscala(escalas, 500)).toBeNull();
  });
});

describe('validarEscalas', () => {
  it('acepta escalas coherentes', () => {
    expect(() => validarEscalas(escalas)).not.toThrow();
  });

  it('rechaza una lista vacía', () => {
    expect(() => validarEscalas([])).toThrow(ErrorDeValidacionDePrecios);
  });

  it('rechaza que la primera escala no empiece en 1', () => {
    expect(() => validarEscalas([{ ...escalas[0], cantidadMinima: 10 }])).toThrow(
      'La primera escala debe empezar en 1 unidad.',
    );
  });

  it('rechaza dos escalas con la misma cantidad mínima', () => {
    const repetidas = [escalas[0], { ...escalas[1], cantidadMinima: 1 }];
    expect(() => validarEscalas(repetidas)).toThrow(ErrorDeValidacionDePrecios);
  });

  it('rechaza que una escala mayor tenga menos descuento', () => {
    const invertidas = [escalas[0], escalas[1], { ...escalas[2], porcentajeDescuento: 5 }];
    expect(() => validarEscalas(invertidas)).toThrow(ErrorDeValidacionDePrecios);
  });

  it('rechaza un descuento de 100 % o más', () => {
    const gratis = [escalas[0], { ...escalas[1], porcentajeDescuento: 100 }];
    expect(() => validarEscalas(gratis)).toThrow(ErrorDeValidacionDePrecios);
  });
});
