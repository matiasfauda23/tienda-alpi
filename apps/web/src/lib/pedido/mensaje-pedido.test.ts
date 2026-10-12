import { describe, expect, it } from 'vitest';
import type { PedidoCalculado } from '../api/tipos';
import { formatearPrecio } from '../formato';
import { armarMensajePedido } from './mensaje-pedido';

const PEDIDO: PedidoCalculado = {
  items: [
    {
      varianteId: 'v1',
      sku: 'MATE-IMPERIAL',
      producto: 'Mate Imperial de Calabaza',
      productoSlug: 'mate-imperial-de-calabaza',
      variante: 'Único',
      colorHex: null,
      cantidad: 3,
      precioUnitario: 12000,
      subtotal: 36000,
      stockDisponible: 50,
      superaStock: false,
    },
  ],
  totalUnidades: 3,
  escalaAplicada: { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  siguienteEscala: null,
  unidadesParaSiguienteEscala: 0,
  totalPrecioLista: 45000,
  total: 36000,
  ahorro: 9000,
};

describe('armarMensajePedido', () => {
  it('incluye cada ítem con SKU, la escala y los totales', () => {
    const mensaje = armarMensajePedido(PEDIDO);
    expect(mensaje).toContain('3 x Mate Imperial de Calabaza (Único) [MATE-IMPERIAL]');
    expect(mensaje).toContain(`= ${formatearPrecio(36000)}`);
    expect(mensaje).toContain('Escala: Minorista');
    expect(mensaje).toContain(`Ahorro: ${formatearPrecio(9000)}`);
    expect(mensaje).toContain(`Total: ${formatearPrecio(36000)}`);
  });

  it('avisa si un ítem supera el stock y omite el ahorro si es 0', () => {
    const item = { ...PEDIDO.items[0], superaStock: true };
    const mensaje = armarMensajePedido({ ...PEDIDO, items: [item], ahorro: 0 });
    expect(mensaje).toContain('(consultar stock)');
    expect(mensaje).not.toContain('Ahorro');
  });
});
