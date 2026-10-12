export const ORDENES_CATALOGO = ['recientes', 'precio-asc', 'precio-desc', 'nombre'] as const;
export type OrdenCatalogo = (typeof ORDENES_CATALOGO)[number];

export const ORDEN_POR_DEFECTO: OrdenCatalogo = 'recientes';
export const PRODUCTOS_POR_PAGINA = 12;
const LARGO_MAXIMO_BUSQUEDA = 100;
const FORMATO_SLUG = /^[a-z0-9-]+$/;

export type FiltrosCatalogo = {
  categorias: string[];
  buscar: string;
  precioMin?: number;
  precioMax?: number;
  orden: OrdenCatalogo;
  pagina: number;
};

export type ParametrosUrl = Record<string, string | string[] | undefined>;

/** Devuelve todos los valores de un parámetro (puede venir repetido en la URL). */
function todosLosValores(valor: string | string[] | undefined): string[] {
  if (valor === undefined) return [];
  return Array.isArray(valor) ? valor : [valor];
}

/** Devuelve el primer valor de un parámetro de la URL. */
function primerValor(valor: string | string[] | undefined): string | undefined {
  return todosLosValores(valor)[0];
}

/** Convierte un texto en entero positivo, o undefined si no es válido. */
function leerEnteroPositivo(valor?: string): number | undefined {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : undefined;
}

/** Convierte un texto en precio (número >= 0), o undefined si está vacío o no es válido. */
function leerPrecio(valor?: string): number | undefined {
  if (valor === undefined || valor.trim() === '') return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? Math.floor(numero) : undefined;
}

/** Indica si un texto es uno de los órdenes permitidos. */
function esOrdenValido(valor?: string): valor is OrdenCatalogo {
  return ORDENES_CATALOGO.includes(valor as OrdenCatalogo);
}

/** Lee las categorías ("a,b" o repetidas), descarta slugs inválidos y duplicados. */
function leerCategorias(valor: string | string[] | undefined): string[] {
  const slugs = todosLosValores(valor)
    .flatMap((texto) => texto.split(','))
    .map((slug) => slug.trim().toLowerCase())
    .filter((slug) => FORMATO_SLUG.test(slug));
  return [...new Set(slugs)];
}

/** Ordena el rango de precios si el mínimo quedó mayor que el máximo. */
function ordenarRango(min?: number, max?: number): [number | undefined, number | undefined] {
  return min !== undefined && max !== undefined && min > max ? [max, min] : [min, max];
}

/** Convierte los searchParams de la URL en filtros válidos y limpios. */
export function leerFiltrosCatalogo(parametros: ParametrosUrl): FiltrosCatalogo {
  const orden = primerValor(parametros.orden);
  const [precioMin, precioMax] = ordenarRango(
    leerPrecio(primerValor(parametros.precioMin)),
    leerPrecio(primerValor(parametros.precioMax)),
  );
  return {
    categorias: leerCategorias(parametros.categoria),
    buscar: (primerValor(parametros.buscar) ?? '').trim().slice(0, LARGO_MAXIMO_BUSQUEDA),
    precioMin,
    precioMax,
    orden: esOrdenValido(orden) ? orden : ORDEN_POR_DEFECTO,
    pagina: leerEnteroPositivo(primerValor(parametros.pagina)) ?? 1,
  };
}

/** Arma los parámetros de URL omitiendo los valores por defecto. */
function crearParametros(filtros: FiltrosCatalogo): URLSearchParams {
  const parametros = new URLSearchParams();
  if (filtros.categorias.length > 0) parametros.set('categoria', filtros.categorias.join(','));
  if (filtros.buscar) parametros.set('buscar', filtros.buscar);
  if (filtros.precioMin !== undefined) parametros.set('precioMin', String(filtros.precioMin));
  if (filtros.precioMax !== undefined) parametros.set('precioMax', String(filtros.precioMax));
  if (filtros.orden !== ORDEN_POR_DEFECTO) parametros.set('orden', filtros.orden);
  if (filtros.pagina > 1) parametros.set('pagina', String(filtros.pagina));
  return parametros;
}

/** Arma la ruta para pedirle productos a la API con estos filtros. */
export function armarConsultaApi(filtros: FiltrosCatalogo): string {
  const parametros = crearParametros(filtros);
  parametros.set('porPagina', String(PRODUCTOS_POR_PAGINA));
  return `/productos?${parametros.toString()}`;
}

/** Arma un link del catálogo aplicando cambios; si cambia un filtro, vuelve a la página 1. */
export function armarUrlCatalogo(
  filtros: FiltrosCatalogo,
  cambios: Partial<FiltrosCatalogo> = {},
): string {
  const consulta = crearParametros({ ...filtros, pagina: 1, ...cambios }).toString();
  return consulta ? `/productos?${consulta}` : '/productos';
}

/** Agrega la categoría si no estaba seleccionada, o la quita si ya estaba. */
export function alternarCategoria(categorias: string[], slug: string): string[] {
  return categorias.includes(slug)
    ? categorias.filter((actual) => actual !== slug)
    : [...categorias, slug];
}

/** Indica si hay algún filtro activo (para mostrar "Limpiar filtros"). */
export function hayFiltrosActivos(filtros: FiltrosCatalogo): boolean {
  return (
    filtros.categorias.length > 0 ||
    filtros.buscar !== '' ||
    filtros.precioMin !== undefined ||
    filtros.precioMax !== undefined
  );
}
