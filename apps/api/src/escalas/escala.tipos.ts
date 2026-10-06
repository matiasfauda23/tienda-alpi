import { Prisma } from '../generated/prisma/client';

/** Campos de una escala que devuelve la API. */
export const CAMPOS_ESCALA = {
  id: true,
  nombre: true,
  cantidadMinima: true,
  porcentajeDescuento: true,
} satisfies Prisma.EscalaPrecioSelect;

/** Una escala tal como la devuelve la API (coincide con la EscalaPrecio del paquete de precios). */
export type EscalaResumen = Prisma.EscalaPrecioGetPayload<{ select: typeof CAMPOS_ESCALA }>;

/** Datos de una escala para guardar: con id se actualiza, sin id se crea. */
export interface DatosEscala {
  id?: string;
  nombre: string;
  cantidadMinima: number;
  porcentajeDescuento: number;
}
