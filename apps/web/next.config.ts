import type { NextConfig } from 'next';

/** Configuración de Next.js para el sitio de Tienda Alpi. */
const nextConfig: NextConfig = {
  // Activa el modelo de caché con 'use cache', cacheLife y cacheTag
  cacheComponents: true,

  // Precarga la "estructura" de las páginas al pasar por los links, para que la navegación sea instantánea
  partialPrefetching: true,
};

export default nextConfig;
