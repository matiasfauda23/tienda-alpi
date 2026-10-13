import type { CambioVariante, ValoresVariante } from './tipos';

export const TAMANIO_MAXIMO_PLANILLA = 2 * 1024 * 1024;

/** Revisa el archivo antes de subirlo: que sea .xlsx y no supere los 2 MB (la API lo vuelve a revisar). */
export function validarArchivoPlanilla(archivo: { name: string; size: number }): string | null {
  if (!archivo.name.toLowerCase().endsWith('.xlsx')) return 'El archivo tiene que ser una planilla .xlsx.';
  if (archivo.size === 0) return 'El archivo está vacío.';
  if (archivo.size > TAMANIO_MAXIMO_PLANILLA) return 'El archivo es demasiado grande (máximo 2 MB).';
  return null;
}

/** Arma el nombre del archivo descargado con la fecha local (no UTC). */
export function armarNombreDescarga(fecha: Date): string {
  const dosDigitos = (numero: number) => String(numero).padStart(2, '0');
  const dia = `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
  return `tienda-alpi-precios-${dia}.xlsx`;
}

/** Devuelve qué valores cambian en una variante, para resaltarlos en la vista previa. */
export function camposModificados(cambio: CambioVariante): (keyof ValoresVariante)[] {
  const campos: (keyof ValoresVariante)[] = ['precio', 'precioOferta', 'stock'];
  return campos.filter((campo) => cambio.antes[campo] !== cambio.despues[campo]);
}
