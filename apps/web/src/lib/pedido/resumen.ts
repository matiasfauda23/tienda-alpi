import { calcularPedido, type EscalaPrecio, type ResultadoPedido } from '@tienda-alpi/precios';
import type { Producto, Variante } from '../api/tipos';
import { convertirVarianteEnItem } from '../precios-producto';
import type { LineaPedido } from './lineas';

type DatosVariante = { producto: Producto; variante: Variante };

export type LineaResumen = DatosVariante & {
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  superaStock: boolean;
};

export type ResumenPedido = Omit<ResultadoPedido, 'items'> & {
  lineas: LineaResumen[];
  noDisponibles: string[];
};

/** Indexa todas las variantes de los productos por su id. */
function indexarVariantes(productos: readonly Producto[]): Map<string, DatosVariante> {
  return new Map(
    productos.flatMap((producto) =>
      producto.variantes.map((variante) => [variante.id, { producto, variante }] as const),
    ),
  );
}

/** Calcula el pedido con el paquete de precios; devuelve null si no hay escalas configuradas. */
export function armarResumenPedido(
  lineas: readonly LineaPedido[],
  productos: readonly Producto[],
  escalas: readonly EscalaPrecio[],
): ResumenPedido | null {
  if (escalas.length === 0) return null;
  const variantes = indexarVariantes(productos);
  const encontradas = lineas.flatMap((linea) => {
    const datos = variantes.get(linea.varianteId);
    return datos ? [convertirVarianteEnItem(datos.variante, linea.cantidad)] : [];
  });
  const { items, ...totales } = calcularPedido(encontradas, escalas);
  return {
    ...totales,
    lineas: items.flatMap((item) => {
      const datos = variantes.get(item.varianteId);
      if (!datos) return [];
      return [
        {
          ...datos,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          superaStock: item.cantidad > datos.variante.stock,
        },
      ];
    }),
    noDisponibles: lineas
      .filter((linea) => !variantes.has(linea.varianteId))
      .map((linea) => linea.varianteId),
  };
}
