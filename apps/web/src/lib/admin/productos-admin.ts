import type { Producto } from '../api/tipos';

export type FiltroEstado = 'todos' | 'activos' | 'ocultos';

/** Pasa a minúsculas y quita tildes para comparar textos ("Térmico" = "termico"). */
export function normalizarParaBuscar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Filtra los productos del panel por texto (nombre, categoría o SKU) y por estado. */
export function filtrarProductosAdmin(
  productos: readonly Producto[],
  texto: string,
  estado: FiltroEstado,
): Producto[] {
  const buscado = normalizarParaBuscar(texto);
  return productos.filter((producto) => {
    if (estado === 'activos' && !producto.activo) return false;
    if (estado === 'ocultos' && producto.activo) return false;
    if (!buscado) return true;
    const campos = [producto.nombre, producto.categoria.nombre, ...producto.variantes.map((v) => v.sku)];
    return campos.some((campo) => normalizarParaBuscar(campo).includes(buscado));
  });
}
