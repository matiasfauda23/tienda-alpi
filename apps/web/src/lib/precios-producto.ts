import {
  calcularPrecioUnitario,
  ordenarEscalas,
  type EscalaPrecio,
  type ItemPedido,
} from '@tienda-alpi/precios';
import type { Variante } from './api/tipos';

export type PrecioEnEscala = {
  escala: EscalaPrecio;
  cantidadMaxima: number | null;
  precioUnitario: number;
  porcentajeAhorro: number;
};

const formatoNumero = new Intl.NumberFormat('es-AR');

/** Convierte una variante de la API en el ítem que espera el paquete de precios. */
export function convertirVarianteEnItem(variante: Variante, cantidad = 1): ItemPedido {
  return {
    varianteId: variante.id,
    cantidad,
    precioBase: variante.precio,
    precioOferta: variante.precioOferta,
    preciosFijosPorEscala: Object.fromEntries(
      variante.preciosFijos.map((fijo) => [fijo.escalaId, fijo.precioUnitario]),
    ),
  };
}

/** Calcula el porcentaje entero que se ahorra respecto del precio de lista. */
export function calcularPorcentajeAhorro(precioLista: number, precioFinal: number): number {
  if (precioLista <= 0 || precioFinal >= precioLista) return 0;
  return Math.round(((precioLista - precioFinal) / precioLista) * 100);
}

/** Calcula el precio por unidad de la variante en cada escala, ordenadas de menor a mayor. */
export function calcularPreciosPorEscala(
  variante: Variante,
  escalas: readonly EscalaPrecio[],
): PrecioEnEscala[] {
  const item = convertirVarianteEnItem(variante);
  const ordenadas = ordenarEscalas(escalas);
  return ordenadas.map((escala, indice) => {
    const siguiente = ordenadas[indice + 1];
    const precioUnitario = calcularPrecioUnitario(item, escala);
    return {
      escala,
      cantidadMaxima: siguiente ? siguiente.cantidadMinima - 1 : null,
      precioUnitario,
      porcentajeAhorro: calcularPorcentajeAhorro(variante.precio, precioUnitario),
    };
  });
}

/** Describe un rango de unidades: "1 a 99" o "500 o más". */
export function describirRango(minimo: number, maximo: number | null): string {
  const desde = formatoNumero.format(minimo);
  return maximo === null ? `${desde} o más` : `${desde} a ${formatoNumero.format(maximo)}`;
}
