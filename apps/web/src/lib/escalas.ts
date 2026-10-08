import { ordenarEscalas, type EscalaPrecio } from '@tienda-alpi/precios';

/** Una escala con el texto de su rango de unidades. */
export type EscalaConRango = {
  escala: EscalaPrecio;
  rango: string;
};

/** Describe el rango de cada escala según dónde empieza la siguiente: "De 1 a 99 unidades", "500 unidades o más". */
export function describirRangos(escalas: EscalaPrecio[]): EscalaConRango[] {
  const ordenadas = ordenarEscalas(escalas);

  return ordenadas.map((escala, indice) => {
    const siguiente = ordenadas[indice + 1];
    const rango = siguiente
      ? `De ${escala.cantidadMinima} a ${siguiente.cantidadMinima - 1} unidades`
      : `${escala.cantidadMinima} unidades o más`;

    return { escala, rango };
  });
}
