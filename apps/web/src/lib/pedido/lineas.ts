export const CANTIDAD_MAXIMA_POR_LINEA = 9999;
export const MAXIMO_LINEAS = 100;
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FORMATO_SLUG = /^[a-z0-9-]{1,120}$/;

export type LineaPedido = { varianteId: string; productoSlug: string; cantidad: number };
export type ReferenciaVariante = Pick<LineaPedido, 'varianteId' | 'productoSlug'>;

/** Lleva una cantidad a un entero entre 0 y el máximo permitido. */
export function normalizarCantidad(cantidad: number): number {
  if (!Number.isFinite(cantidad)) return 0;
  return Math.min(Math.max(Math.floor(cantidad), 0), CANTIDAD_MAXIMA_POR_LINEA);
}

/** Quita una variante del pedido. */
export function quitarDelPedido(lineas: readonly LineaPedido[], varianteId: string): LineaPedido[] {
  return lineas.filter((linea) => linea.varianteId !== varianteId);
}

/** Cambia la cantidad de una variante que ya está en el pedido; con 0 o menos la quita. */
export function cambiarCantidad(
  lineas: readonly LineaPedido[],
  varianteId: string,
  cantidad: number,
): LineaPedido[] {
  const normalizada = normalizarCantidad(cantidad);
  if (normalizada === 0) return quitarDelPedido(lineas, varianteId);
  return lineas.map((linea) =>
    linea.varianteId === varianteId ? { ...linea, cantidad: normalizada } : linea,
  );
}

/** Suma unidades de una variante al pedido; si ya estaba, las acumula. */
export function agregarAlPedido(
  lineas: readonly LineaPedido[],
  referencia: ReferenciaVariante,
  cantidad: number,
): LineaPedido[] {
  const existente = lineas.find((linea) => linea.varianteId === referencia.varianteId);
  if (existente) return cambiarCantidad(lineas, existente.varianteId, existente.cantidad + cantidad);
  const normalizada = normalizarCantidad(cantidad);
  if (normalizada === 0 || lineas.length >= MAXIMO_LINEAS) return [...lineas];
  return [
    ...lineas,
    { varianteId: referencia.varianteId, productoSlug: referencia.productoSlug, cantidad: normalizada },
  ];
}

/** Cuenta el total de unidades del pedido (todas las variantes juntas). */
export function contarUnidades(lineas: readonly LineaPedido[]): number {
  return lineas.reduce((total, linea) => total + linea.cantidad, 0);
}

/** Devuelve los slugs de productos del pedido, sin repetir y ordenados. */
export function obtenerSlugsDelPedido(lineas: readonly LineaPedido[]): string[] {
  return [...new Set(lineas.map((linea) => linea.productoSlug))].sort();
}

/** Indica si un valor desconocido tiene forma de línea de pedido válida. */
function esLineaValida(valor: unknown): valor is LineaPedido {
  if (typeof valor !== 'object' || valor === null) return false;
  const { varianteId, productoSlug, cantidad } = valor as Record<string, unknown>;
  return (
    typeof varianteId === 'string' &&
    FORMATO_UUID.test(varianteId) &&
    typeof productoSlug === 'string' &&
    FORMATO_SLUG.test(productoSlug) &&
    typeof cantidad === 'number' &&
    Number.isInteger(cantidad) &&
    cantidad > 0
  );
}

/** Interpreta un pedido guardado (texto JSON); descarta todo lo inválido y une duplicados. */
export function leerPedidoGuardado(texto: string | null): LineaPedido[] {
  if (!texto) return [];
  try {
    const datos: unknown = JSON.parse(texto);
    if (!Array.isArray(datos)) return [];
    return datos
      .filter(esLineaValida)
      .reduce<LineaPedido[]>((pedido, linea) => agregarAlPedido(pedido, linea, linea.cantidad), []);
  } catch {
    return [];
  }
}
