/** Cookie con el token de acceso: dura poco y viaja en cada petición a /api. */
export const COOKIE_ACCESO = 'alpi_acceso';

/** Cookie con el token de refresh: dura más y solo viaja a /api/auth. */
export const COOKIE_REFRESH = 'alpi_refresh';

/** El token de acceso vence a los 15 minutos. */
export const DURACION_ACCESO_SEGUNDOS = 15 * 60;

/** El token de refresh vence a los 7 días. */
export const DURACION_REFRESH_SEGUNDOS = 7 * 24 * 60 * 60;
