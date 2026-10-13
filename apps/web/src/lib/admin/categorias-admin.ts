import type { Categoria } from '../api/tipos';

export type BorradorCategoria = { nombre: string; orden: string; activa: boolean };
export type CambiosCategoria = Partial<{ nombre: string; orden: number; activa: boolean }>;

/** Ordena las categorías como se ven en la tienda: por orden y, si empatan, por nombre. */
export function ordenarCategorias(categorias: readonly Categoria[]): Categoria[] {
  return [...categorias].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'));
}

/** Calcula el orden para una categoría nueva: una posición después de la última. */
export function calcularSiguienteOrden(categorias: readonly Categoria[]): number {
  return Math.min(1000, categorias.reduce((maximo, c) => Math.max(maximo, c.orden + 1), 0));
}

/** Crea el borrador editable a partir de una categoría guardada. */
export function crearBorradorCategoria(categoria: Categoria): BorradorCategoria {
  return { nombre: categoria.nombre, orden: String(categoria.orden), activa: categoria.activa };
}

/** Revisa el borrador con las mismas reglas que la API; devuelve el error o null. */
export function validarBorradorCategoria(borrador: BorradorCategoria): string | null {
  const nombre = borrador.nombre.trim();
  if (nombre.length < 2 || nombre.length > 80) return 'El nombre debe tener entre 2 y 80 caracteres.';
  const orden = Number(borrador.orden);
  if (borrador.orden.trim() === '' || !Number.isInteger(orden) || orden < 0 || orden > 1000) {
    return 'El orden debe ser un número entero entre 0 y 1000.';
  }
  return null;
}

/** Devuelve solo los campos que cambiaron, para mandar un PATCH mínimo. */
export function armarCambiosCategoria(original: Categoria, borrador: BorradorCategoria): CambiosCategoria {
  const cambios: CambiosCategoria = {};
  const nombre = borrador.nombre.trim();
  const orden = Number(borrador.orden);
  if (nombre !== original.nombre) cambios.nombre = nombre;
  if (orden !== original.orden) cambios.orden = orden;
  if (borrador.activa !== original.activa) cambios.activa = borrador.activa;
  return cambios;
}
