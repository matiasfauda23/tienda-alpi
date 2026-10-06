import { Prisma } from '../generated/prisma/client';

/** Campos de una categoría que devuelve la API (sin fechas internas). */
export const CAMPOS_CATEGORIA = {
  id: true,
  nombre: true,
  slug: true,
  orden: true,
  activa: true,
} satisfies Prisma.CategoriaSelect;

/** Tipo de una categoría tal como la devuelve la API. */
export type CategoriaResumen = Prisma.CategoriaGetPayload<{ select: typeof CAMPOS_CATEGORIA }>;

/** Datos necesarios para guardar una categoría nueva. */
export interface DatosNuevaCategoria {
  nombre: string;
  slug: string;
  orden?: number;
  activa?: boolean;
}

/** Datos que se pueden cambiar de una categoría existente. */
export type DatosActualizarCategoria = Partial<DatosNuevaCategoria>;
