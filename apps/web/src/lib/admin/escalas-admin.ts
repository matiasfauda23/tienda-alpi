import { ordenarEscalas, validarEscalas, type EscalaPrecio } from '@tienda-alpi/precios';
import { leerEntero, type Errores } from './formulario-producto';

export type BorradorEscala = {
  clave: string;
  id?: string;
  nombre: string;
  cantidadMinima: string;
  porcentajeDescuento: string;
};

export type EscalaParaGuardar = {
  id?: string;
  nombre: string;
  cantidadMinima: number;
  porcentajeDescuento: number;
};

let contadorNuevas = 0;

/** Genera una clave única para una escala que todavía no tiene id (React la usa como key). */
function crearClaveNueva(): string {
  contadorNuevas += 1;
  return `nueva-${contadorNuevas}`;
}

/** Arma los borradores editables a partir de las escalas guardadas, de menor a mayor cantidad. */
export function crearBorradoresEscalas(escalas: readonly EscalaPrecio[]): BorradorEscala[] {
  return ordenarEscalas(escalas).map((escala) => ({
    clave: escala.id,
    id: escala.id,
    nombre: escala.nombre,
    cantidadMinima: String(escala.cantidadMinima),
    porcentajeDescuento: String(escala.porcentajeDescuento),
  }));
}

/** Crea una escala vacía, sugiriendo el doble de la cantidad más alta. */
export function crearBorradorEscalaNueva(existentes: readonly BorradorEscala[]): BorradorEscala {
  const mayor = existentes.reduce((maximo, escala) => Math.max(maximo, leerEntero(escala.cantidadMinima) ?? 0), 0);
  return { clave: crearClaveNueva(), nombre: '', cantidadMinima: String(mayor > 0 ? mayor * 2 : 1), porcentajeDescuento: '' };
}

/** Revisa una escala con las mismas reglas que la API. */
export function validarBorradorEscala(borrador: BorradorEscala): Errores<BorradorEscala> {
  const errores: Errores<BorradorEscala> = {};
  const nombre = borrador.nombre.trim();
  if (nombre.length < 2 || nombre.length > 60) errores.nombre = 'Entre 2 y 60 caracteres.';
  const cantidad = leerEntero(borrador.cantidadMinima);
  if (cantidad === null || cantidad < 1 || cantidad > 1_000_000) errores.cantidadMinima = 'Entero entre 1 y 1.000.000.';
  const porcentaje = leerEntero(borrador.porcentajeDescuento);
  if (porcentaje === null || porcentaje > 99) errores.porcentajeDescuento = 'Entero entre 0 y 99.';
  return errores;
}

/** Convierte los borradores (ya validados) en la lista que espera la API; las nuevas van sin id. */
export function convertirBorradoresEscalas(borradores: readonly BorradorEscala[]): EscalaParaGuardar[] {
  return borradores.map((borrador) => ({
    ...(borrador.id ? { id: borrador.id } : {}),
    nombre: borrador.nombre.trim(),
    cantidadMinima: leerEntero(borrador.cantidadMinima) ?? 0,
    porcentajeDescuento: leerEntero(borrador.porcentajeDescuento) ?? 0,
  }));
}

/** Completa ids provisorios para poder usar las funciones del paquete de precios. */
export function conIdsProvisorios(escalas: readonly EscalaParaGuardar[]): EscalaPrecio[] {
  return escalas.map((escala, indice) => ({ ...escala, id: escala.id ?? `provisoria-${indice}` }));
}

/** Valida el conjunto con la misma función que usa la API; devuelve el mensaje de error o null. */
export function buscarErrorEnConjunto(escalas: readonly EscalaParaGuardar[]): string | null {
  try {
    validarEscalas(conIdsProvisorios(escalas));
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Las escalas no son válidas.';
  }
}

/** Indica si las escalas editadas difieren de las guardadas, sin importar el orden. */
export function sonDistintasEscalas(
  guardadas: readonly EscalaPrecio[],
  nuevas: readonly EscalaParaGuardar[],
): boolean {
  const comoTexto = (lista: readonly EscalaParaGuardar[]) =>
    lista
      .map((e) => `${e.id ?? ''}|${e.nombre}|${e.cantidadMinima}|${e.porcentajeDescuento}`)
      .sort()
      .join(';');
  return comoTexto(guardadas) !== comoTexto(nuevas);
}
