import { aplicarDescuento, EscalaPrecio, ordenarEscalas } from '@tienda-alpi/precios';

/** Precio por unidad de una variante en una escala. */
export interface PrecioEnEscala {
  escala: EscalaPrecio;
  precio: number;
}

/** Calcula el precio por unidad de una variante en cada escala: el fijo si existe, si no el porcentaje. */
export function calcularPreciosPorEscala(
  precioBase: number,
  escalas: EscalaPrecio[],
  preciosFijos: Map<string, number>,
): PrecioEnEscala[] {
  return ordenarEscalas(escalas).map((escala) => ({
    escala,
    precio: preciosFijos.get(escala.id) ?? aplicarDescuento(precioBase, escala.porcentajeDescuento),
  }));
}

/**
 * Busca un error en los precios por escala de una variante: que alguno supere el precio de lista,
 * o que el precio por unidad suba al pasar a una escala mayor. Devuelve el mensaje, o null si está todo bien.
 */
export function buscarErrorEnPreciosPorEscala(
  precioBase: number,
  escalas: EscalaPrecio[],
  preciosFijos: Map<string, number>,
): string | null {
  const precios = calcularPreciosPorEscala(precioBase, escalas, preciosFijos);

  const masCaroQueLaLista = precios.find((item) => item.precio > precioBase);
  if (masCaroQueLaLista) {
    return `El precio en "${masCaroQueLaLista.escala.nombre}" ($${masCaroQueLaLista.precio}) no puede ser mayor que el precio de lista ($${precioBase}).`;
  }

  for (let indice = 1; indice < precios.length; indice++) {
    const anterior = precios[indice - 1];
    const actual = precios[indice];

    if (actual.precio > anterior.precio) {
      return `En "${actual.escala.nombre}" el precio ($${actual.precio}) no puede ser mayor que en "${anterior.escala.nombre}" ($${anterior.precio}).`;
    }
  }

  return null;
}
