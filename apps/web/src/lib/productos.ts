import type { Producto, Variante } from './api/tipos';

export const UMBRAL_ULTIMAS_UNIDADES = 3;
const FORMATO_COLOR_HEX = /^#[0-9a-fA-F]{6}$/;

export type EstadoStock = 'agotado' | 'ultimas' | 'disponible';
export type ColorVariante = { nombre: string; hex: string };

/** Indica si la variante tiene un precio de oferta menor al normal. */
export function tieneOfertaVigente(variante: Variante): boolean {
  return variante.precioOferta !== null && variante.precioOferta < variante.precio;
}

/** Devuelve el precio minorista que se cobra hoy por la variante (oferta si corresponde). */
export function obtenerPrecioVigente(variante: Variante): number {
  return variante.precioOferta !== null && variante.precioOferta < variante.precio
    ? variante.precioOferta
    : variante.precio;
}

/** Indica si alguna variante del producto está en oferta. */
export function tieneOferta(producto: Producto): boolean {
  return producto.variantes.some(tieneOfertaVigente);
}

/** Suma el stock de todas las variantes del producto. */
export function calcularStockTotal(producto: Producto): number {
  return producto.variantes.reduce((total, variante) => total + variante.stock, 0);
}

/** Clasifica un stock en agotado, últimas unidades o disponible. */
export function obtenerEstadoStock(stock: number): EstadoStock {
  if (stock <= 0) return 'agotado';
  if (stock <= UMBRAL_ULTIMAS_UNIDADES) return 'ultimas';
  return 'disponible';
}

/** Devuelve los colores válidos de las variantes, en su orden. */
export function obtenerColores(producto: Producto): ColorVariante[] {
  return producto.variantes
    .filter((variante) => variante.colorHex !== null && FORMATO_COLOR_HEX.test(variante.colorHex))
    .map((variante) => ({ nombre: variante.nombre, hex: variante.colorHex as string }));
}
