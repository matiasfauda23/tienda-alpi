import { ErrorDeApiAdmin } from './cliente-admin';

export const RUTA_INICIO_PANEL = '/admin';
export const RUTA_INGRESO = '/admin/ingresar';
const FORMATO_RUTA_PANEL = /^\/admin(?:\/[a-z0-9-]+)*\/?$/;

/** Devuelve a dónde ir tras el login: solo rutas internas del panel (evita redirecciones a otros sitios). */
export function elegirDestinoSeguro(volver: string | null): string {
  if (!volver || !FORMATO_RUTA_PANEL.test(volver) || volver.startsWith(RUTA_INGRESO)) {
    return RUTA_INICIO_PANEL;
  }
  return volver;
}

/** Indica si un link del menú corresponde a la página actual. */
export function esEnlaceActivo(href: string, rutaActual: string): boolean {
  if (href === RUTA_INICIO_PANEL) return rutaActual === RUTA_INICIO_PANEL;
  return rutaActual === href || rutaActual.startsWith(`${href}/`);
}

/** Traduce el error del login a un mensaje claro, sin revelar si el email existe. */
export function describirErrorDeIngreso(error: unknown): string {
  if (error instanceof ErrorDeApiAdmin) {
    if (error.estado === 401) return 'Email o contraseña incorrectos.';
    if (error.estado === 429) return 'Demasiados intentos. Esperá 15 minutos y probá de nuevo.';
    if (error.estado === 400) return 'Revisá el email y la contraseña.';
  }
  return 'No se pudo conectar con el servidor. Probá de nuevo en un momento.';
}
