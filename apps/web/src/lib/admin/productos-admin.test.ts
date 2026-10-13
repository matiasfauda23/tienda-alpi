import { describe, expect, it } from 'vitest';
import type { Producto } from '../api/tipos';
import { filtrarProductosAdmin, normalizarParaBuscar } from './productos-admin';

/** Crea un producto de prueba con un SKU. */
function crearProducto(nombre: string, sku: string, activo = true): Producto {
  return {
    id: sku,
    nombre,
    slug: sku.toLowerCase(),
    descripcion: '',
    destacado: false,
    nuevo: false,
    activo,
    precioDesde: 1000,
    categoria: { id: 'c1', nombre: 'Mates', slug: 'mates', activa: true },
    variantes: [
      { id: 'v', sku, nombre: 'Único', colorHex: null, precio: 1000, precioOferta: null, stock: 1, orden: 0, preciosFijos: [] },
    ],
  };
}

const PRODUCTOS = [
  crearProducto('Mate Térmico Imperial', 'MATE-IMP'),
  crearProducto('Termo Acero', 'TERMO-1', false),
];

describe('filtrarProductosAdmin', () => {
  it('busca sin importar tildes ni mayúsculas', () => {
    expect(normalizarParaBuscar('  TÉRMICO ')).toBe('termico');
    expect(filtrarProductosAdmin(PRODUCTOS, 'termico', 'todos').map((p) => p.id)).toEqual(['MATE-IMP']);
  });

  it('busca por SKU y por categoría', () => {
    expect(filtrarProductosAdmin(PRODUCTOS, 'termo-1', 'todos')).toHaveLength(1);
    expect(filtrarProductosAdmin(PRODUCTOS, 'mates', 'todos')).toHaveLength(2);
  });

  it('filtra por estado', () => {
    expect(filtrarProductosAdmin(PRODUCTOS, '', 'activos').map((p) => p.id)).toEqual(['MATE-IMP']);
    expect(filtrarProductosAdmin(PRODUCTOS, '', 'ocultos').map((p) => p.id)).toEqual(['TERMO-1']);
  });
});
