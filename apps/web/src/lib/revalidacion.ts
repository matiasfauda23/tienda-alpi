import { timingSafeEqual } from 'node:crypto';

export const ETIQUETAS_CACHE = ['productos', 'categorias', 'escalas', 'contenido'] as const;
export type EtiquetaCache = (typeof ETIQUETAS_CACHE)[number];

const LARGO_MINIMO_SECRETO = 32;

/** Indica si un valor es una de las etiquetas de caché que usa la tienda. */
function esEtiquetaConocida(valor: unknown): valor is EtiquetaCache {
  return ETIQUETAS_CACHE.includes(valor as EtiquetaCache);
}

/** Extrae del aviso solo las etiquetas conocidas, sin repetir (ignora todo lo demás). */
export function leerEtiquetas(cuerpo: unknown): EtiquetaCache[] {
  if (typeof cuerpo !== 'object' || cuerpo === null) return [];
  const { etiquetas } = cuerpo as { etiquetas?: unknown };
  if (!Array.isArray(etiquetas)) return [];
  return [...new Set(etiquetas.filter(esEtiquetaConocida))];
}

/** Compara el token del encabezado "Authorization: Bearer ..." con el secreto, en tiempo constante. */
export function esTokenValido(encabezado: string | null, secreto: string | undefined): boolean {
  if (!secreto || secreto.length < LARGO_MINIMO_SECRETO || !encabezado?.startsWith('Bearer ')) return false;
  const recibido = Buffer.from(encabezado.slice('Bearer '.length));
  const esperado = Buffer.from(secreto);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}
