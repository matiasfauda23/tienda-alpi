import { SetMetadata } from '@nestjs/common';

export const CLAVE_REVALIDACION = 'etiquetasRevalidacion';

/** Partes de la caché de la tienda que se pueden vencer (las mismas que usa la web en cacheTag). */
export type EtiquetaCache = 'productos' | 'categorias' | 'escalas' | 'contenido';

/** Indica qué cachés de la tienda vencer cuando un endpoint cambia datos. Sin etiquetas: no avisa. */
export const Revalidar = (...etiquetas: EtiquetaCache[]) => SetMetadata(CLAVE_REVALIDACION, etiquetas);
