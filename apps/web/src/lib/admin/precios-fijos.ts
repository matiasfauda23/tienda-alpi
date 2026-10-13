import type { EscalaPrecio } from '@tienda-alpi/precios';
import type { Variante } from '../api/tipos';
import { leerEntero } from './formulario-producto';

export type BorradorPreciosFijos = Record<string, string>;
export type PrecioFijo = { escalaId: string; precioUnitario: number };

/** Arma el borrador con los precios fijos guardados (texto por id de escala). */
export function crearBorradorPreciosFijos(variante: Variante): BorradorPreciosFijos {
  return Object.fromEntries(variante.preciosFijos.map((precio) => [precio.escalaId, String(precio.precioUnitario)]));
}

/** Revisa que cada precio escrito sea un entero entre 1 y 100 millones (vacío = usa el porcentaje). */
export function validarBorradorPreciosFijos(borrador: BorradorPreciosFijos): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const [escalaId, texto] of Object.entries(borrador)) {
    if (texto.trim() === '') continue;
    const precio = leerEntero(texto);
    if (precio === null || precio < 1 || precio > 100_000_000) errores[escalaId] = 'Número entero mayor a 0.';
  }
  return errores;
}

/** Convierte el borrador en la lista que espera la API: solo escalas existentes y con precio. */
export function convertirBorradorPreciosFijos(
  borrador: BorradorPreciosFijos,
  escalas: readonly EscalaPrecio[],
): PrecioFijo[] {
  return escalas.flatMap((escala) => {
    const precio = leerEntero(borrador[escala.id] ?? '');
    return precio !== null && precio >= 1 ? [{ escalaId: escala.id, precioUnitario: precio }] : [];
  });
}

/** Indica si los precios fijos cambiaron respecto de los guardados, sin importar el orden. */
export function sonDistintosPreciosFijos(guardados: readonly PrecioFijo[], nuevos: readonly PrecioFijo[]): boolean {
  const comoTexto = (lista: readonly PrecioFijo[]) =>
    lista
      .map((precio) => `${precio.escalaId}:${precio.precioUnitario}`)
      .sort()
      .join('|');
  return comoTexto(guardados) !== comoTexto(nuevos);
}
