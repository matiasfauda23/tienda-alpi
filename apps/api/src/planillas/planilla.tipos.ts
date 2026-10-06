// Se usan "type" (y no "interface") para poder guardar los cambios como JSON en la auditoría.

/** Resultado de leer un número de una celda. */
export type LecturaNumero =
  | { tipo: 'vacio' }
  | { tipo: 'numero'; valor: number }
  | { tipo: 'invalido'; texto: string };

/** Una fila de la planilla subida, tal como se leyó (todavía sin validar). */
export type FilaLeida = {
  numero: number; // Número de fila en Excel, para mostrar errores ("fila 12")
  sku: string;
  precio: LecturaNumero;
  precioOferta: LecturaNumero;
  stock: LecturaNumero;
};

/** Los tres valores que se pueden cambiar desde la planilla. */
export type ValoresVariante = {
  precio: number;
  precioOferta: number | null;
  stock: number;
};

/** Una variante tal como está hoy en la base. */
export type VarianteActual = ValoresVariante & {
  id: string;
  productoId: string;
  sku: string;
  producto: string;
  variante: string;
};

/** Un cambio que se aplicaría a una variante. */
export type CambioVariante = {
  varianteId: string;
  productoId: string;
  sku: string;
  producto: string;
  variante: string;
  antes: ValoresVariante;
  despues: ValoresVariante;
};

/** Un error en una fila de la planilla. */
export type ErrorDeFila = {
  fila: number;
  sku: string;
  mensaje: string;
};

/** Resultado de comparar la planilla con la base: qué cambia, qué está mal y cuántas filas quedan igual. */
export type ComparacionPlanilla = {
  cambios: CambioVariante[];
  errores: ErrorDeFila[];
  sinCambios: number;
};

/** Resultado de aplicar una planilla. */
export type ResultadoImportacion = {
  actualizadas: number;
  sinCambios: number;
};

/** Una fila de la planilla que se exporta. */
export type FilaExportada = {
  sku: string;
  categoria: string;
  producto: string;
  variante: string;
  precio: number;
  precioOferta: number | null;
  stock: number;
};

/** Un archivo recibido en una petición (los campos que usamos de lo que entrega Multer). */
export type ArchivoSubido = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};
