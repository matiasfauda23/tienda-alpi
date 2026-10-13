import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const PUERTO_WEB = 3100;
export const PUERTO_API = 3101;
export const URL_WEB = `http://localhost:${PUERTO_WEB}`;
export const URL_API = `http://localhost:${PUERTO_API}/api`;
export const RAIZ_PROYECTO = resolve(__dirname, '../..');
export const RUTA_SESION = resolve(__dirname, 'playwright/.auth/admin.json');

// Credenciales y secretos SOLO para la base de pruebas (no sirven para nada real)
export const ADMIN_E2E = { email: 'e2e@tiendaalpi.test', contrasena: 'contrasena-solo-para-pruebas-e2e' };
const SECRETO_REVALIDACION = 'secreto-de-prueba-e2e-revalidacion-0123456789';

/** Arma la URL de la base de pruebas a partir de la de desarrollo, cambiando solo el nombre. */
function obtenerUrlBaseE2E(): string {
  if (process.env.DATABASE_URL_E2E) return process.env.DATABASE_URL_E2E;
  const entorno = readFileSync(resolve(RAIZ_PROYECTO, 'apps/api/.env'), 'utf8');
  const coincidencia = entorno.match(/^DATABASE_URL=["']?([^"'\n]+)["']?$/m);
  if (!coincidencia) throw new Error('No encontré DATABASE_URL en apps/api/.env. Definí DATABASE_URL_E2E.');
  const url = new URL(coincidencia[1]);
  url.pathname = '/tienda_alpi_e2e';
  return url.toString();
}

/** Corta todo si la base no es la de pruebas: estos tests BORRAN la base en cada ejecución. */
function exigirBaseDePruebas(url: string): string {
  const nombre = new URL(url).pathname.replace('/', '');
  if (!nombre.endsWith('_e2e')) {
    throw new Error(`Por seguridad, la base de E2E debe terminar en "_e2e" (se recibió "${nombre}").`);
  }
  return url;
}

export const URL_BASE_E2E = exigirBaseDePruebas(obtenerUrlBaseE2E());

export const ENTORNO_API = {
  DATABASE_URL: URL_BASE_E2E,
  PORT: String(PUERTO_API),
  URL_FRONTEND: URL_WEB,
  JWT_SECRETO_ACCESO: 'secreto-de-prueba-e2e-acceso-0123456789abcdef',
  JWT_SECRETO_REFRESH: 'secreto-de-prueba-e2e-refresh-0123456789abcdef',
  REVALIDACION_SECRETO: SECRETO_REVALIDACION,
  ADMIN_CONTRASENA: ADMIN_E2E.contrasena,
};

export const ENTORNO_WEB = {
  API_URL: URL_API,
  NEXT_PUBLIC_API_URL: URL_API,
  REVALIDACION_SECRETO: SECRETO_REVALIDACION,
  DIRECTORIO_NEXT: '.next-e2e',
};
