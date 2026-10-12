import type { ItemPedidoCalculado, PedidoCalculado } from '../api/tipos';
import { formatearPrecio } from '../formato';

/** Arma la línea de un ítem: cantidad, producto, variante, SKU y precios. */
function describirItem(item: ItemPedidoCalculado): string {
  const avisoStock = item.superaStock ? ' (consultar stock)' : '';
  return (
    `• ${item.cantidad} x ${item.producto} (${item.variante}) [${item.sku}]: ` +
    `${formatearPrecio(item.precioUnitario)} c/u = ${formatearPrecio(item.subtotal)}${avisoStock}`
  );
}

/** Arma el mensaje de WhatsApp con el detalle del pedido ya verificado por la API. */
export function armarMensajePedido(pedido: PedidoCalculado): string {
  const ahorro = pedido.ahorro > 0 ? [`Ahorro: ${formatearPrecio(pedido.ahorro)}`] : [];
  return [
    '¡Hola! Quiero hacer este pedido:',
    '',
    ...pedido.items.map(describirItem),
    '',
    `Unidades: ${pedido.totalUnidades}`,
    `Escala: ${pedido.escalaAplicada?.nombre ?? '-'}`,
    ...ahorro,
    `Total: ${formatearPrecio(pedido.total)}`,
    '',
    '¿Me confirmás stock, envío y forma de pago?',
  ].join('\n');
}
