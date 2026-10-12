import type { Producto, Variante } from './api/tipos';

/** Arma el mensaje para consultar por un producto, nombrando la variante si hay más de una. */
export function armarMensajeConsulta(producto: Producto, variante: Variante): string {
  const detalle = producto.variantes.length > 1 ? ` (${variante.nombre})` : '';
  return `¡Hola! Quería consultar por ${producto.nombre}${detalle}.`;
}
