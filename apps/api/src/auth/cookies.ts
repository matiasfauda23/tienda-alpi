import type { CookieOptions, Response } from 'express';
import {
  COOKIE_ACCESO,
  COOKIE_REFRESH,
  DURACION_ACCESO_SEGUNDOS,
  DURACION_REFRESH_SEGUNDOS,
} from './auth.constantes';
import { ParDeTokens } from './auth.tipos';

/** Opciones comunes: invisibles para JavaScript, solo por HTTPS en producción y nunca enviadas desde otro sitio. */
function opcionesBase(esProduccion: boolean): CookieOptions {
  return { httpOnly: true, secure: esProduccion, sameSite: 'strict' };
}

/** Guarda los dos tokens de la sesión en cookies. */
export function guardarCookiesDeSesion(
  respuesta: Response,
  tokens: ParDeTokens,
  esProduccion: boolean,
): void {
  respuesta.cookie(COOKIE_ACCESO, tokens.acceso, {
    ...opcionesBase(esProduccion),
    path: '/api',
    maxAge: DURACION_ACCESO_SEGUNDOS * 1000,
  });

  // El refresh solo viaja a /api/auth: no se expone en cada petición
  respuesta.cookie(COOKIE_REFRESH, tokens.refresh, {
    ...opcionesBase(esProduccion),
    path: '/api/auth',
    maxAge: DURACION_REFRESH_SEGUNDOS * 1000,
  });
}

/** Borra las cookies de la sesión (con el mismo path con que se crearon). */
export function borrarCookiesDeSesion(respuesta: Response, esProduccion: boolean): void {
  respuesta.clearCookie(COOKIE_ACCESO, { ...opcionesBase(esProduccion), path: '/api' });
  respuesta.clearCookie(COOKIE_REFRESH, { ...opcionesBase(esProduccion), path: '/api/auth' });
}
