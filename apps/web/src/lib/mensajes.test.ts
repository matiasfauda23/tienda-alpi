import { describe, expect, it } from 'vitest';
import type { Producto, Variante } from './api/tipos';
import { armarMensajeConsulta } from './mensajes';

const VARIANTE = { id: 'v1', nombre: 'Negro' } as Variante;
const OTRA = { id: 'v2', nombre: 'Verde' } as Variante;

/** Crea un producto de prueba con las variantes dadas. */
function crearProducto(variantes: Variante[]): Producto {
  return { nombre: 'Mate Imperial', variantes } as Producto;
}

describe('armarMensajeConsulta', () => {
  it('nombra la variante si el producto tiene varias', () => {
    expect(armarMensajeConsulta(crearProducto([VARIANTE, OTRA]), VARIANTE)).toBe(
      '¡Hola! Quería consultar por Mate Imperial (Negro).',
    );
  });

  it('no nombra la variante si es la única', () => {
    expect(armarMensajeConsulta(crearProducto([VARIANTE]), VARIANTE)).toBe(
      '¡Hola! Quería consultar por Mate Imperial.',
    );
  });
});
