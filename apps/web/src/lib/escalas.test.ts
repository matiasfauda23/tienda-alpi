import { describe, expect, it } from 'vitest';
import { describirRangos } from './escalas';

describe('describirRangos', () => {
  it('arma los rangos según dónde empieza la escala siguiente', () => {
    const escalas = [
      { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
      { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
      { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
    ];

    expect(describirRangos(escalas).map((item) => item.rango)).toEqual([
      'De 1 a 99 unidades',
      'De 100 a 499 unidades',
      '500 unidades o más',
    ]);
  });
});
