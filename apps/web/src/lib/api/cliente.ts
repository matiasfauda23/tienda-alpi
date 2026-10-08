import 'server-only';
import { obtenerUrlApi } from '../configuracion';

/** Error al comunicarse con la API. Guarda el código HTTP para distinguir un 404 de una falla. */
export class ErrorDeApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeApi';
    this.estado = estado;
  }
}

/** Hace un GET a la API y devuelve la respuesta ya convertida desde JSON. */
export async function pedirALaApi<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${obtenerUrlApi()}${ruta}`, {
    headers: { Accept: 'application/json' },
  });

  if (!respuesta.ok) {
    throw new ErrorDeApi(respuesta.status, `La API respondió ${respuesta.status} en ${ruta}.`);
  }
  return (await respuesta.json()) as T;
}
