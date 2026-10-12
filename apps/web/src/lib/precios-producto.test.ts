import { describe, expect, it } from 'vitest';
import type { Variante } from './api/tipos';
import {
  calcularPorcentajeAhorro,
  calcularPreciosPorEscala,
  convertirVarianteEnItem,
  describirRango,
} from './precios-producto';

const ESCALAS = [
  { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

/** Crea una variante de prueba con valores por defecto. */
function crearVariante(cambios: Partial<Variante> = {}): Variante {
  return {
    id: 'v1',
    sku: 'SKU-1',
    nombre: 'Negro',
    colorHex: null,
    precio: 10000,
    precioOferta: null,
    stock: 10,
    orden: 0,
    preciosFijos: [],
    ...cambios,
  };
}

describe('convertirVarianteEnItem', () => {
  it('pasa los precios fijos a un objeto por id de escala', () => {
    const variante = crearVariante({ preciosFijos: [{ escalaId: 'e2', precioUnitario: 8500 }] });
    expect(convertirVarianteEnItem(variante).preciosFijosPorEscala).toEqual({ e2: 8500 });
  });
});

describe('calcularPreciosPorEscala', () => {
  it('aplica el descuento de cada escala y arma los rangos', () => {
    const precios = calcularPreciosPorEscala(crearVariante(), ESCALAS);
    expect(precios.map((p) => p.precioUnitario)).toEqual([10000, 9000, 8000]);
    expect(precios.map((p) => p.porcentajeAhorro)).toEqual([0, 10, 20]);
    expect(precios.map((p) => p.cantidadMaxima)).toEqual([99, 499, null]);
  });

  it('usa el precio fijo de la escala si existe', () => {
    const variante = crearVariante({ preciosFijos: [{ escalaId: 'e2', precioUnitario: 8500 }] });
    const precios = calcularPreciosPorEscala(variante, ESCALAS);
    expect(precios[1]).toMatchObject({ precioUnitario: 8500, porcentajeAhorro: 15 });
  });

  it('usa la oferta cuando es más barata que la escala', () => {
    const precios = calcularPreciosPorEscala(crearVariante({ precioOferta: 9500 }), ESCALAS);
    expect(precios.map((p) => p.precioUnitario)).toEqual([9500, 9000, 8000]);
  });

  it('ordena las escalas aunque lleguen desordenadas', () => {
    const precios = calcularPreciosPorEscala(crearVariante(), [...ESCALAS].reverse());
    expect(precios.map((p) => p.escala.nombre)).toEqual(['Minorista', 'Mayorista', 'Distribuidor']);
  });
});

describe('calcularPorcentajeAhorro y describirRango', () => {
  it('no devuelve ahorros negativos ni divide por cero', () => {
    expect(calcularPorcentajeAhorro(10000, 12000)).toBe(0);
    expect(calcularPorcentajeAhorro(0, 0)).toBe(0);
  });

  it('describe rangos con separador de miles', () => {
    expect(describirRango(1, 99)).toBe('1 a 99');
    expect(describirRango(500, null)).toBe('500 o más');
    expect(describirRango(1000, 4999)).toBe('1.000 a 4.999');
  });
});
