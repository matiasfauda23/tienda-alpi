import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { armarConsultaApi, type FiltrosCatalogo } from '../catalogo';
import { ErrorDeApi, pedirALaApi } from './cliente';
import type { PaginaDeResultados, Producto } from './tipos';

const FORMATO_SLUG = /^[a-z0-9-]{1,120}$/;

/** Trae una página del catálogo con los filtros dados (se invalida con la etiqueta 'productos'). */
export async function obtenerProductos(
  filtros: FiltrosCatalogo,
): Promise<PaginaDeResultados<Producto>> {
  'use cache';
  cacheLife('hours');
  cacheTag('productos');
  return pedirALaApi<PaginaDeResultados<Producto>>(armarConsultaApi(filtros));
}

/** Trae un producto por su slug, o null si no existe o el slug es inválido. */
export async function obtenerProducto(slug: string): Promise<Producto | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('productos');
  if (!FORMATO_SLUG.test(slug)) return null;
  try {
    return await pedirALaApi<Producto>(`/productos/${slug}`);
  } catch (error) {
    if (error instanceof ErrorDeApi && error.estado === 404) return null;
    throw error;
  }
}
