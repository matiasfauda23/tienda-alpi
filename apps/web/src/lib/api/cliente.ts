import 'server-only';
import { obtenerUrlApi } from '../configuracion';

/** Error de la API que conserva el código HTTP de la respuesta. */
export class ErrorDeApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeApi';
    this.estado = estado;
  }
}

/** Hace la llamada a la API y devuelve el JSON; lanza ErrorDeApi si la respuesta no es exitosa. */
async function llamarALaApi<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${obtenerUrlApi()}${ruta}`, opciones);
  if (!respuesta.ok) {
    throw new ErrorDeApi(respuesta.status, `La API respondió ${respuesta.status} en ${ruta}`);
  }
  return (await respuesta.json()) as T;
}

/** Pide datos a la API (GET). */
export function pedirALaApi<T>(ruta: string): Promise<T> {
  return llamarALaApi<T>(ruta);
}

/** Envía datos a la API (POST con JSON), sin caché. */
export function enviarALaApi<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return llamarALaApi<T>(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    cache: 'no-store',
  });
}
