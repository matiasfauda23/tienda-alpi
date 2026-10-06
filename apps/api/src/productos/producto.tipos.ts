import { Prisma } from '../generated/prisma/client';

/** Campos de una variante que devuelve la API. */
export const CAMPOS_VARIANTE = {
  id: true,
  sku: true,
  nombre: true,
  colorHex: true,
  precio: true,
  precioOferta: true,
  stock: true,
  orden: true,
} satisfies Prisma.VarianteSelect;

/** Campos de un producto que devuelve la API, con su categoría y sus variantes ordenadas. */
export const CAMPOS_PRODUCTO = {
  id: true,
  nombre: true,
  slug: true,
  descripcion: true,
  destacado: true,
  nuevo: true,
  activo: true,
  categoria: { select: { id: true, nombre: true, slug: true, activa: true } },
  variantes: { select: CAMPOS_VARIANTE, orderBy: { orden: 'asc' as const } },
} satisfies Prisma.ProductoSelect;

/** Un producto tal como lo devuelve la API. */
export type ProductoDetalle = Prisma.ProductoGetPayload<{ select: typeof CAMPOS_PRODUCTO }>;

/** Datos de una variante para guardar en la base. */
export interface DatosVariante {
  sku: string;
  nombre: string;
  colorHex?: string | null;
  precio: number;
  precioOferta?: number | null;
  stock: number;
  orden?: number;
}

/** Datos para guardar un producto nuevo con sus variantes. */
export interface DatosNuevoProducto {
  nombre: string;
  slug: string;
  descripcion?: string;
  categoriaId: string;
  destacado?: boolean;
  nuevo?: boolean;
  activo?: boolean;
  variantes: DatosVariante[];
}

/** Datos que se pueden cambiar de un producto (las variantes se manejan aparte). */
export type DatosActualizarProducto = Partial<Omit<DatosNuevoProducto, 'variantes'>>;

/** Datos que se pueden cambiar de una variante. */
export type DatosActualizarVariante = Partial<DatosVariante>;
