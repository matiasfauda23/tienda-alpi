import { describe, expect, it } from 'vitest';
import type { Producto, Variante } from './api/tipos';
import {
  calcularStockTotal,
  obtenerColores,
  obtenerEstadoStock,
  obtenerPrecioVigente,
  tieneOferta,
} from './productos';

/** Crea una variante de prueba con valores por defecto. */
function crearVariante(cambios: Partial<Variante> = {}): Variante {
  return {
    id: 'v1',
    sku: 'SKU-1',
    nombre: 'Negro',
    colorHex: '#1f1f1f',
    precio: 10000,
    precioOferta: null,
    stock: 10,
    orden: 0,
    preciosFijos: [],
    ...cambios,
  };
}

/** Crea un producto de prueba con las variantes dadas. */
function crearProducto(variantes: Variante[]): Producto {
  return {
    id: 'p1',
    nombre: 'Mate Imperial',
    slug: 'mate-imperial',
    descripcion: '',
    destacado: false,
    nuevo: false,
    activo: true,
    precioDesde: 10000,
    categoria: { id: 'c1', nombre: 'Mates', slug: 'mates', activa: true },
    variantes,
  };
}

describe('precios', () => {
  it('usa la oferta solo si es menor al precio normal', () => {
    expect(obtenerPrecioVigente(crearVariante({ precioOferta: 8000 }))).toBe(8000);
    expect(obtenerPrecioVigente(crearVariante({ precioOferta: 12000 }))).toBe(10000);
    expect(obtenerPrecioVigente(crearVariante())).toBe(10000);
  });

  it('detecta si alguna variante está en oferta', () => {
    expect(tieneOferta(crearProducto([crearVariante(), crearVariante({ precioOferta: 9000 })]))).toBe(true);
    expect(tieneOferta(crearProducto([crearVariante()]))).toBe(false);
  });
});

describe('stock', () => {
  it('suma el stock de las variantes', () => {
    const producto = crearProducto([crearVariante({ stock: 2 }), crearVariante({ stock: 5 })]);
    expect(calcularStockTotal(producto)).toBe(7);
  });

  it('clasifica el estado del stock', () => {
    expect(obtenerEstadoStock(0)).toBe('agotado');
    expect(obtenerEstadoStock(3)).toBe('ultimas');
    expect(obtenerEstadoStock(4)).toBe('disponible');
  });
});

describe('obtenerColores', () => {
  it('descarta variantes sin color o con color inválido', () => {
    const producto = crearProducto([
      crearVariante({ nombre: 'Verde', colorHex: '#5f6e45' }),
      crearVariante({ nombre: 'Sin color', colorHex: null }),
      crearVariante({ nombre: 'Malo', colorHex: 'red;background:url(x)' }),
    ]);
    expect(obtenerColores(producto)).toEqual([{ nombre: 'Verde', hex: '#5f6e45' }]);
  });
});
