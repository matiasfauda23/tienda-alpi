import { PeticionAutenticada } from '../auth/auth.tipos';
import { Prisma } from '../generated/prisma/client';
import { DatosRegistroAuditoria } from './auditoria.tipos';

/** Nombres de campos que nunca se guardan en la auditoría. */
const CAMPOS_SENSIBLES = /contrasena|password|token|secreto/i;

/** Indica si un valor es un objeto común (no null, no lista). */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** Reemplaza por "[oculto]" cualquier campo sensible, también dentro de objetos y listas anidadas. */
export function ocultarDatosSensibles(valor: unknown): unknown {
  if (Array.isArray(valor)) {
    return valor.map(ocultarDatosSensibles);
  }
  if (esObjeto(valor)) {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, dato]) => [
        clave,
        CAMPOS_SENSIBLES.test(clave) ? '[oculto]' : ocultarDatosSensibles(dato),
      ]),
    );
  }
  return valor;
}

/** Saca de la ruta qué se modificó: "/api/admin/productos/:id" → "productos". */
export function obtenerEntidad(ruta: string): string {
  const partes = ruta.split('/').filter(Boolean);
  return partes[partes.indexOf('admin') + 1] ?? 'desconocida';
}

/** Devuelve el id de la respuesta si lo tiene (por ejemplo, al crear algo nuevo). */
function obtenerIdDeLaRespuesta(respuesta: unknown): string | null {
  return esObjeto(respuesta) && typeof respuesta.id === 'string' ? respuesta.id : null;
}

/** Arma el registro de auditoría de una petición del panel que terminó bien. */
export function armarRegistro(peticion: PeticionAutenticada, respuesta: unknown): DatosRegistroAuditoria {
  // Ruta con parámetros ("/api/admin/productos/:id") en lugar de la real con ids
  const ruta = String((peticion.route as { path?: string } | undefined)?.path ?? peticion.path);
  const parametros = peticion.params as Record<string, string | undefined>;

  return {
    administradorId: peticion.administrador?.id ?? null,
    accion: peticion.method,
    entidad: obtenerEntidad(ruta),
    entidadId: parametros.varianteId ?? parametros.id ?? obtenerIdDeLaRespuesta(respuesta),
    ruta,
    datos: ocultarDatosSensibles(peticion.body) as Prisma.InputJsonValue | undefined,
    ip: peticion.ip ?? null,
  };
}
