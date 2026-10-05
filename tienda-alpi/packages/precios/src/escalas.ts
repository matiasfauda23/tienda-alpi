import { ErrorDeValidacionDePrecios } from './errores';
import { EscalaPrecio } from './tipos';

/** Devuelve una copia de las escalas ordenadas de menor a mayor cantidad mínima. */
export function ordenarEscalas(escalas: readonly EscalaPrecio[]): EscalaPrecio[] {
  return [...escalas].sort((a, b) => a.cantidadMinima - b.cantidadMinima);
}

/** Verifica que las escalas sean coherentes; lanza un error si alguna regla no se cumple. */
export function validarEscalas(escalas: readonly EscalaPrecio[]): void {
  if (escalas.length === 0) {
    throw new ErrorDeValidacionDePrecios('Debe existir al menos una escala de precio.');
  }

  const ordenadas = ordenarEscalas(escalas);

  ordenadas.forEach((escala, indice) => {
    validarEscalaIndividual(escala);
    const anterior = ordenadas[indice - 1];
    if (anterior) {
      validarEscalaContraAnterior(escala, anterior);
    }
  });

  if (ordenadas[0].cantidadMinima !== 1) {
    throw new ErrorDeValidacionDePrecios('La primera escala debe empezar en 1 unidad.');
  }
}

/** Verifica que una escala tenga una cantidad mínima y un descuento válidos. */
function validarEscalaIndividual(escala: EscalaPrecio): void {
  if (!Number.isInteger(escala.cantidadMinima) || escala.cantidadMinima < 1) {
    throw new ErrorDeValidacionDePrecios(
      `La escala "${escala.nombre}" debe tener una cantidad mínima entera mayor a 0.`,
    );
  }
  if (escala.porcentajeDescuento < 0 || escala.porcentajeDescuento >= 100) {
    throw new ErrorDeValidacionDePrecios(
      `El descuento de la escala "${escala.nombre}" debe estar entre 0 y 99.`,
    );
  }
}

/** Verifica que una escala mayor no repita el mínimo ni dé menos descuento que la anterior. */
function validarEscalaContraAnterior(escala: EscalaPrecio, anterior: EscalaPrecio): void {
  if (escala.cantidadMinima === anterior.cantidadMinima) {
    throw new ErrorDeValidacionDePrecios('No puede haber dos escalas con la misma cantidad mínima.');
  }
  if (escala.porcentajeDescuento < anterior.porcentajeDescuento) {
    throw new ErrorDeValidacionDePrecios(
      `La escala "${escala.nombre}" no puede tener menos descuento que "${anterior.nombre}".`,
    );
  }
}

/** Devuelve la escala que corresponde a una cantidad total: la de mayor mínimo alcanzado. */
export function obtenerEscalaParaCantidad(
  escalas: readonly EscalaPrecio[],
  cantidadTotal: number,
): EscalaPrecio | null {
  const alcanzadas = ordenarEscalas(escalas).filter(
    (escala) => cantidadTotal >= escala.cantidadMinima,
  );
  return alcanzadas.at(-1) ?? null;
}

/** Devuelve la próxima escala que el pedido todavía no alcanzó, o null si ya está en la mejor. */
export function obtenerSiguienteEscala(
  escalas: readonly EscalaPrecio[],
  cantidadTotal: number,
): EscalaPrecio | null {
  return ordenarEscalas(escalas).find((escala) => escala.cantidadMinima > cantidadTotal) ?? null;
}
