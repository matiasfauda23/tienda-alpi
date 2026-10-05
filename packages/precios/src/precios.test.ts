import { describe, expect, it } from 'vitest';
import { ErrorDeValidacionDePrecios } from './errores';
import { aplicarDescuento, calcularPedido, calcularPrecioUnitario } from './precios';
import { EscalaPrecio, ItemPedido } from './tipos';

const escalas: EscalaPrecio[] = [
  { id: 'e1', nombre: 'Lista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

/** Crea un ítem de prueba con valores por defecto que se pueden pisar. */
function crearItem(datos: Partial<ItemPedido> = {}): ItemPedido {
  return { varianteId: 'mate-negro', cantidad: 1, precioBase: 10000, ...datos };
}

describe('aplicarDescuento', () => {
  it('aplica el porcentaje y redondea a pesos enteros', () => {
    expect(aplicarDescuento(10000, 10)).toBe(9000);
    expect(aplicarDescuento(9999, 15)).toBe(8499);
  });
});

describe('calcularPrecioUnitario', () => {
  it('usa el precio fijo de la escala si existe', () => {
    const item = crearItem({ preciosFijosPorEscala: { e2: 8500 } });
    expect(calcularPrecioUnitario(item, escalas[1])).toBe(8500);
  });

  it('usa la oferta si es menor que el precio de la escala', () => {
    const item = crearItem({ precioOferta: 8000 });
    expect(calcularPrecioUnitario(item, escalas[1])).toBe(8000);
  });

  it('ignora la oferta si la escala ya da un precio menor', () => {
    const item = crearItem({ precioOferta: 9500 });
    expect(calcularPrecioUnitario(item, escalas[2])).toBe(8000);
  });
});

describe('calcularPedido', () => {
  it('suma productos distintos para elegir la escala (60 + 40 = 100)', () => {
    const resultado = calcularPedido(
      [
        crearItem({ varianteId: 'mate-negro', cantidad: 60 }),
        crearItem({ varianteId: 'mate-verde', cantidad: 40 }),
      ],
      escalas,
    );

    expect(resultado.totalUnidades).toBe(100);
    expect(resultado.escalaAplicada?.id).toBe('e2');
    expect(resultado.items.every((item) => item.precioUnitario === 9000)).toBe(true);
    expect(resultado.total).toBe(900000);
    expect(resultado.ahorro).toBe(100000);
  });

  it('con 99 unidades paga precio de lista y le faltan 1 para la siguiente escala', () => {
    const resultado = calcularPedido([crearItem({ cantidad: 99 })], escalas);

    expect(resultado.escalaAplicada?.id).toBe('e1');
    expect(resultado.total).toBe(990000);
    expect(resultado.unidadesParaSiguienteEscala).toBe(1);
  });

  it('con 500 unidades aplica la mejor escala y no hay siguiente', () => {
    const resultado = calcularPedido([crearItem({ cantidad: 500 })], escalas);

    expect(resultado.escalaAplicada?.id).toBe('e3');
    expect(resultado.siguienteEscala).toBeNull();
    expect(resultado.unidadesParaSiguienteEscala).toBe(0);
  });

  it('ignora los ítems con cantidad 0', () => {
    const resultado = calcularPedido(
      [crearItem({ cantidad: 0 }), crearItem({ varianteId: 'vaso-lila', cantidad: 5 })],
      escalas,
    );

    expect(resultado.items).toHaveLength(1);
    expect(resultado.totalUnidades).toBe(5);
  });

  it('un pedido vacío da total 0 y sin escala', () => {
    const resultado = calcularPedido([], escalas);

    expect(resultado.total).toBe(0);
    expect(resultado.escalaAplicada).toBeNull();
  });

  it.each([-1, 2.5])('rechaza la cantidad inválida %s', (cantidad) => {
    expect(() => calcularPedido([crearItem({ cantidad })], escalas)).toThrow(
      ErrorDeValidacionDePrecios,
    );
  });
});
