import type { Producto, Variante } from '../api/tipos';

const FORMATO_SKU = /^[A-Z0-9-]{2,60}$/;
const FORMATO_COLOR = /^#[0-9A-Fa-f]{6}$/;
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BorradorProducto = {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  destacado: boolean;
  nuevo: boolean;
  activo: boolean;
};

export type BorradorVariante = {
  sku: string;
  nombre: string;
  colorHex: string;
  precio: string;
  precioOferta: string;
  stock: string;
  orden: string;
};

export type DatosProducto = BorradorProducto;

export type DatosVariante = {
  sku: string;
  nombre: string;
  colorHex: string | null;
  precio: number;
  precioOferta: number | null;
  stock: number;
  orden: number;
};

export type Errores<T> = Partial<Record<keyof T, string>>;

/** Indica si un id tiene formato UUID (evita pedirle a la API ids inventados). */
export function esIdValido(id: string): boolean {
  return FORMATO_UUID.test(id);
}

/** Deja solo los dígitos de lo que se escribe ("15.000" queda "15000"). */
export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Convierte un texto de solo dígitos en número; devuelve null si está vacío o tiene otra cosa. */
export function leerEntero(texto: string): number | null {
  const limpio = texto.trim();
  return /^\d+$/.test(limpio) ? Number(limpio) : null;
}

/** Indica si un objeto de errores tiene al menos un error. */
export function hayErrores(errores: object): boolean {
  return Object.keys(errores).length > 0;
}

/** Crea el borrador del producto (vacío o a partir de uno existente). */
export function crearBorradorProducto(producto?: Producto): BorradorProducto {
  return {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    categoriaId: producto?.categoria.id ?? '',
    destacado: producto?.destacado ?? false,
    nuevo: producto?.nuevo ?? false,
    activo: producto?.activo ?? true,
  };
}

/** Crea el borrador de una variante (vacío o a partir de una existente). */
export function crearBorradorVariante(variante?: Variante, ordenSugerido = 0): BorradorVariante {
  return {
    sku: variante?.sku ?? '',
    nombre: variante?.nombre ?? '',
    colorHex: variante?.colorHex ?? '',
    precio: variante ? String(variante.precio) : '',
    precioOferta: variante?.precioOferta != null ? String(variante.precioOferta) : '',
    stock: variante ? String(variante.stock) : '',
    orden: String(variante?.orden ?? ordenSugerido),
  };
}

/** Revisa los datos del producto con las mismas reglas que la API. */
export function validarBorradorProducto(borrador: BorradorProducto): Errores<BorradorProducto> {
  const errores: Errores<BorradorProducto> = {};
  const nombre = borrador.nombre.trim();
  if (nombre.length < 2 || nombre.length > 120) errores.nombre = 'Debe tener entre 2 y 120 caracteres.';
  if (borrador.descripcion.trim().length > 2000) errores.descripcion = 'No puede superar los 2000 caracteres.';
  if (!borrador.categoriaId) errores.categoriaId = 'Elegí una categoría.';
  return errores;
}

/** Revisa una variante con las mismas reglas que la API (y que la oferta sea menor al precio). */
export function validarBorradorVariante(borrador: BorradorVariante): Errores<BorradorVariante> {
  const errores: Errores<BorradorVariante> = {};
  if (!FORMATO_SKU.test(borrador.sku.trim().toUpperCase())) {
    errores.sku = 'Solo letras, números y guiones (de 2 a 60).';
  }
  const nombre = borrador.nombre.trim();
  if (nombre.length < 1 || nombre.length > 80) errores.nombre = 'Debe tener entre 1 y 80 caracteres.';
  if (borrador.colorHex && !FORMATO_COLOR.test(borrador.colorHex)) errores.colorHex = 'Formato #RRGGBB.';

  const precio = leerEntero(borrador.precio);
  if (precio === null || precio < 1 || precio > 100_000_000) errores.precio = 'Número entero mayor a 0.';
  if (borrador.precioOferta.trim() !== '') {
    const oferta = leerEntero(borrador.precioOferta);
    if (oferta === null || oferta < 1) errores.precioOferta = 'Número entero mayor a 0.';
    else if (precio !== null && oferta >= precio) errores.precioOferta = 'Debe ser menor al precio.';
  }

  const stock = leerEntero(borrador.stock);
  if (stock === null || stock > 1_000_000) errores.stock = 'Número entero entre 0 y 1.000.000.';
  const orden = leerEntero(borrador.orden);
  if (orden === null || orden > 1000) errores.orden = 'Número entre 0 y 1000.';
  return errores;
}

/** Busca un SKU repetido entre las variantes del formulario; devuelve el primero o null. */
export function encontrarSkuRepetido(variantes: readonly BorradorVariante[]): string | null {
  const vistos = new Set<string>();
  for (const variante of variantes) {
    const sku = variante.sku.trim().toUpperCase();
    if (!sku) continue;
    if (vistos.has(sku)) return sku;
    vistos.add(sku);
  }
  return null;
}

/** Convierte el borrador del producto en los datos que espera la API. */
export function convertirBorradorProducto(borrador: BorradorProducto): DatosProducto {
  return { ...borrador, nombre: borrador.nombre.trim(), descripcion: borrador.descripcion.trim() };
}

/** Convierte el borrador de una variante (ya validado) en los datos que espera la API. */
export function convertirBorradorVariante(borrador: BorradorVariante): DatosVariante {
  return {
    sku: borrador.sku.trim().toUpperCase(),
    nombre: borrador.nombre.trim(),
    colorHex: borrador.colorHex || null,
    precio: leerEntero(borrador.precio) ?? 0,
    precioOferta: leerEntero(borrador.precioOferta),
    stock: leerEntero(borrador.stock) ?? 0,
    orden: leerEntero(borrador.orden) ?? 0,
  };
}

/** Extrae de un producto guardado los mismos campos que edita el formulario. */
export function datosDeProducto(producto: Producto): DatosProducto {
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoriaId: producto.categoria.id,
    destacado: producto.destacado,
    nuevo: producto.nuevo,
    activo: producto.activo,
  };
}

/** Extrae de una variante guardada los mismos campos que edita el formulario. */
export function datosDeVariante(variante: Variante): DatosVariante {
  const { sku, nombre, colorHex, precio, precioOferta, stock, orden } = variante;
  return { sku, nombre, colorHex, precio, precioOferta, stock, orden };
}

/** Devuelve solo los campos cuyo valor cambió, para mandar un PATCH mínimo. */
export function diferencias<T extends object>(original: T, nuevo: T): Partial<T> {
  const cambios: Partial<T> = {};
  for (const campo of Object.keys(nuevo) as (keyof T)[]) {
    if (nuevo[campo] !== original[campo]) cambios[campo] = nuevo[campo];
  }
  return cambios;
}
