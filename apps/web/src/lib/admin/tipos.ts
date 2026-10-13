// Formas de los datos del panel (deben coincidir con lo que devuelve la API).

export type Administrador = { id: string; email: string };

export type ValoresVariante = { precio: number; precioOferta: number | null; stock: number };

export type CambioVariante = {
  varianteId: string;
  productoId: string;
  sku: string;
  producto: string;
  variante: string;
  antes: ValoresVariante;
  despues: ValoresVariante;
};

export type ErrorDeFila = { fila: number; sku: string; mensaje: string };

export type ComparacionPlanilla = { cambios: CambioVariante[]; errores: ErrorDeFila[]; sinCambios: number };

export type ResultadoImportacion = { actualizadas: number; sinCambios: number };
