import { ErrorDeValidacionDePrecios } from './errores';
import { obtenerEscalaParaCantidad, obtenerSiguienteEscala, validarEscalas } from './escalas';
import { EscalaPrecio, ItemCalculado, ItemPedido, ResultadoPedido } from './tipos';

/** Aplica un porcentaje de descuento a un precio y lo redondea a pesos enteros. */
export function aplicarDescuento(precio: number, porcentajeDescuento: number): number {
  return Math.round((precio * (100 - porcentajeDescuento)) / 100);
}

/** Calcula el precio por unidad de un ítem: precio fijo de la escala, o descuento, o la oferta si es menor. */
export function calcularPrecioUnitario(item: ItemPedido, escala: EscalaPrecio): number {
  const precioFijo = item.preciosFijosPorEscala?.[escala.id];
  const precioPorEscala = precioFijo ?? aplicarDescuento(item.precioBase, escala.porcentajeDescuento);

  const { precioOferta } = item;
  if (precioOferta != null && precioOferta < precioPorEscala) {
    return precioOferta;
  }
  return precioPorEscala;
}

/** Calcula el pedido completo: escala aplicada, precio de cada ítem, total y ahorro. */
export function calcularPedido(
  items: readonly ItemPedido[],
  escalas: readonly EscalaPrecio[],
): ResultadoPedido {
  validarEscalas(escalas);
  items.forEach(validarItem);

  const itemsConCantidad = items.filter((item) => item.cantidad > 0);
  const totalUnidades = sumar(itemsConCantidad.map((item) => item.cantidad));
  const escalaAplicada = obtenerEscalaParaCantidad(escalas, totalUnidades);
  const siguienteEscala = obtenerSiguienteEscala(escalas, totalUnidades);

  const itemsCalculados = escalaAplicada
    ? itemsConCantidad.map((item) => calcularItem(item, escalaAplicada))
    : [];

  const totalPrecioLista = sumar(itemsConCantidad.map((item) => item.precioBase * item.cantidad));
  const total = sumar(itemsCalculados.map((item) => item.subtotal));

  return {
    totalUnidades,
    escalaAplicada,
    siguienteEscala,
    unidadesParaSiguienteEscala: siguienteEscala ? siguienteEscala.cantidadMinima - totalUnidades : 0,
    items: itemsCalculados,
    totalPrecioLista,
    total,
    ahorro: totalPrecioLista - total,
  };
}

/** Calcula el precio unitario y el subtotal de un ítem con la escala indicada. */
function calcularItem(item: ItemPedido, escala: EscalaPrecio): ItemCalculado {
  const precioUnitario = calcularPrecioUnitario(item, escala);
  return { ...item, precioUnitario, subtotal: precioUnitario * item.cantidad };
}

/** Verifica que un ítem tenga una cantidad y un precio base válidos. */
function validarItem(item: ItemPedido): void {
  if (!Number.isInteger(item.cantidad) || item.cantidad < 0) {
    throw new ErrorDeValidacionDePrecios(`Cantidad inválida para la variante ${item.varianteId}.`);
  }
  if (!Number.isInteger(item.precioBase) || item.precioBase <= 0) {
    throw new ErrorDeValidacionDePrecios(`Precio base inválido para la variante ${item.varianteId}.`);
  }
}

/** Suma una lista de números. */
function sumar(valores: readonly number[]): number {
  return valores.reduce((acumulado, valor) => acumulado + valor, 0);
}
