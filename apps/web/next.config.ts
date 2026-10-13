import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Las pruebas E2E usan otra carpeta para no mezclar su caché con la del servidor de desarrollo
  distDir: process.env.DIRECTORIO_NEXT ?? '.next',
};

export default nextConfig;
