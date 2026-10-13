import { describe, expect, it } from 'vitest';
import type { Variante } from '../api/tipos';
import {
  convertirBorradorPreciosFijos,
  crearBorradorPreciosFijos,
  sonDistintosPreciosFijos,
  validarBorradorPreciosFijos,
} from './precios-fijos';

const ESCALAS = [
  { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 15 },
];

const VARIANTE = {
  id: 'v1',
  sku: 'MATE',
  nombre: 'Único',
  colorHex: null,
  precio: 15000,
  precioOferta: null,
  stock: 10,
  orden: 0,
  preciosFijos: [{ escalaId: 'e2', precioUnitario: 12500 }],
} satisfies Variante;

describe('precios fijos', () => {
  it('arma el borrador desde los precios guardados', () => {
    expect(crearBorradorPreciosFijos(VARIANTE)).toEqual({ e2: '12500' });
  });

  it('acepta vacíos y rechaza valores inválidos', () => {
    expect(validarBorradorPreciosFijos({ e1: '', e2: '12500' })).toEqual({});
    expect(validarBorradorPreciosFijos({ e1: '0', e2: '200000000' })).toEqual({
      e1: 'Número entero mayor a 0.',
      e2: 'Número entero mayor a 0.',
    });
  });

  it('convierte solo las escalas existentes que tienen precio', () => {
    expect(convertirBorradorPreciosFijos({ e1: '', e2: '12500', borrada: '9000' }, ESCALAS)).toEqual([
      { escalaId: 'e2', precioUnitario: 12500 },
    ]);
  });

  it('detecta cambios sin importar el orden', () => {
    const guardados = [
      { escalaId: 'e1', precioUnitario: 14000 },
      { escalaId: 'e2', precioUnitario: 12500 },
    ];
    expect(sonDistintosPreciosFijos(guardados, [...guardados].reverse())).toBe(false);
    expect(sonDistintosPreciosFijos(guardados, [guardados[0]])).toBe(true);
  });
});
