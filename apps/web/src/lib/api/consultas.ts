import 'server-only';
import type { EscalaPrecio } from '@tienda-alpi/precios';
import { cacheLife, cacheTag } from 'next/cache';
import { pedirALaApi } from './cliente';
import type { Categoria, ContenidoSitio } from './tipos';

/** Contenido editable del sitio (contacto, banner, FAQ y condiciones). */
export async function obtenerContenido(): Promise<ContenidoSitio> {
  'use cache';
  cacheLife('hours'); // Se renueva solo cada tanto
  cacheTag('contenido'); // Etiqueta para renovarlo al instante cuando Marce lo cambie
  return pedirALaApi<ContenidoSitio>('/contenido');
}

/** Categorías visibles, en el orden que definió Marce. */
export async function obtenerCategorias(): Promise<Categoria[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('categorias');
  return pedirALaApi<Categoria[]>('/categorias');
}

/** Escalas de precio por cantidad. */
export async function obtenerEscalas(): Promise<EscalaPrecio[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('escalas');
  return pedirALaApi<EscalaPrecio[]>('/escalas');
}
