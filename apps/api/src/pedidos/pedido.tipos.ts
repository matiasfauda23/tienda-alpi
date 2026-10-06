import type { EscalaPrecio } from '@tienda-alpi/precios';
import { Prisma } from '../generated/prisma/client';

/** Datos de una variante necesarios para calcular su precio en un pedido. */
export const CAMPOS_VARIANTE_PARA_CALCULO = {
  id: true,
  sku: true,
  nombre: true,
  colorHex: true,
  precio: true,
  precioOferta: true,
  stock: true,
  producto: { select: { nombre: true, slug: true } },
  preciosFijos: { select: { escalaId: true, precioUnitario: true } },
} satisfies Prisma.VarianteSelect;

/** Una variante con todo lo necesario para el cálculo. */
export type VarianteParaCalculo = Prisma.VarianteGetPayload<{
  select: typeof CAMPOS_VARIANTE_PARA_CALCULO;
}>;

/** Un renglón del pedido ya calculado, con los datos para mostrarlo y armar el mensaje de WhatsApp. */
export interface ItemPedidoCalculado {
  varianteId: string;
  sku: string;
  producto: string;
  productoSlug: string;
  variante: string;
  colorHex: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockDisponible: number;
  superaStock: boolean;
}

/** El pedido completo calculado. */
export interface PedidoCalculado {
  items: ItemPedidoCalculado[];
  totalUnidades: number;
  escalaAplicada: EscalaPrecio | null;
  siguienteEscala: EscalaPrecio | null;
  unidadesParaSiguienteEscala: number;
  totalPrecioLista: number;
  total: number;
  ahorro: number;
}
