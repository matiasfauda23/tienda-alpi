import { ErrorDeApiAdmin } from './cliente-admin';

/** Traduce cualquier error del panel a un mensaje claro para mostrar. */
export function describirError(error: unknown): string {
  if (error instanceof ErrorDeApiAdmin) {
    if (error.estado === 429) return 'Demasiados pedidos seguidos. Esperá un minuto y probá de nuevo.';
    if (error.estado >= 500) return 'Ocurrió un error en el servidor. Probá de nuevo en un momento.';
    return error.message;
  }
  return 'No se pudo conectar con el servidor. Probá de nuevo.';
}
