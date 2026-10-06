import { Prisma } from '../generated/prisma/client';

/** Datos de un cambio hecho desde el panel, listos para guardar. */
export interface DatosRegistroAuditoria {
  administradorId: string | null;
  accion: string; // Método HTTP: POST, PUT, PATCH o DELETE
  entidad: string; // Qué se tocó: productos, categorias, escalas, contenido...
  entidadId: string | null;
  ruta: string;
  datos: Prisma.InputJsonValue | undefined; // Lo que se mandó, sin datos sensibles
  ip: string | null;
}

/** Campos de un registro que devuelve la API, con el email de quien hizo el cambio. */
export const CAMPOS_REGISTRO = {
  id: true,
  accion: true,
  entidad: true,
  entidadId: true,
  ruta: true,
  despues: true,
  ip: true,
  creadoEn: true,
  administrador: { select: { email: true } },
} satisfies Prisma.RegistroAuditoriaSelect;

/** Un registro de auditoría tal como lo devuelve la API. */
export type RegistroAuditoriaResumen = Prisma.RegistroAuditoriaGetPayload<{
  select: typeof CAMPOS_REGISTRO;
}>;
