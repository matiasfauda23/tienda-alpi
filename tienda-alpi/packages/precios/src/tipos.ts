/** Una escala de precio: desde cuántas unidades aplica y qué descuento otorga. */
export interface EscalaPrecio {
  id: string;
  nombre: string;
  cantidadMinima: number;
  porcentajeDescuento: number; // De 0 a 99
}

/** Un ítem del pedido tal como lo arma el cliente. Los precios van en pesos enteros. */
export interface ItemPedido {
  varianteId: string;
  cantidad: number;
  precioBase: number; // Precio de lista (primera escala)
  precioOferta?: number | null;
  preciosFijosPorEscala?: Record<string, number>; // id de escala -> precio unitario fijo
}

/** Un ítem del pedido con su precio ya calculado. */
export interface ItemCalculado extends ItemPedido {
  precioUnitario: number;
  subtotal: number;
}

/** El resultado completo de calcular un pedido. */
export interface ResultadoPedido {
  totalUnidades: number;
  escalaAplicada: EscalaPrecio | null;
  siguienteEscala: EscalaPrecio | null;
  unidadesParaSiguienteEscala: number;
  items: ItemCalculado[];
  totalPrecioLista: number;
  total: number;
  ahorro: number;
}
