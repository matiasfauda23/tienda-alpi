import { describe, expect, it } from 'vitest';
import {
  agregarAlPedido,
  cambiarCantidad,
  CANTIDAD_MAXIMA_POR_LINEA,
  contarUnidades,
  leerPedidoGuardado,
  MAXIMO_LINEAS,
  obtenerSlugsDelPedido,
  quitarDelPedido,
} from './lineas';

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';
const MATE = { varianteId: ID_A, productoSlug: 'mate-imperial' };
const TERMO = { varianteId: ID_B, productoSlug: 'termo-acero' };

describe('agregarAlPedido', () => {
  it('agrega una variante nueva', () => {
    expect(agregarAlPedido([], MATE, 3)).toEqual([{ ...MATE, cantidad: 3 }]);
  });

  it('acumula si la variante ya estaba', () => {
    expect(agregarAlPedido([{ ...MATE, cantidad: 3 }], MATE, 2)).toEqual([{ ...MATE, cantidad: 5 }]);
  });

  it('no supera la cantidad máxima por línea', () => {
    const pedido = agregarAlPedido([{ ...MATE, cantidad: 9990 }], MATE, 50);
    expect(pedido[0].cantidad).toBe(CANTIDAD_MAXIMA_POR_LINEA);
  });

  it('no agrega cantidades inválidas ni más líneas que el máximo', () => {
    expect(agregarAlPedido([], MATE, 0)).toEqual([]);
    const lleno = Array.from({ length: MAXIMO_LINEAS }, (_, i) => ({
      varianteId: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      productoSlug: 'mate',
      cantidad: 1,
    }));
    expect(agregarAlPedido(lleno, MATE, 1)).toHaveLength(MAXIMO_LINEAS);
  });
});

describe('cambiarCantidad, quitarDelPedido y consultas', () => {
  const pedido = [
    { ...MATE, cantidad: 3 },
    { ...TERMO, cantidad: 1 },
  ];

  it('cambia la cantidad y redondea hacia abajo', () => {
    expect(cambiarCantidad(pedido, ID_A, 7.9)[0].cantidad).toBe(7);
  });

  it('quita la línea si la cantidad es 0, negativa o no es un número', () => {
    expect(cambiarCantidad(pedido, ID_A, 0)).toEqual([{ ...TERMO, cantidad: 1 }]);
    expect(cambiarCantidad(pedido, ID_A, -4)).toHaveLength(1);
    expect(cambiarCantidad(pedido, ID_A, Number.NaN)).toHaveLength(1);
  });

  it('no agrega nada si la variante no estaba', () => {
    expect(cambiarCantidad([{ ...MATE, cantidad: 1 }], ID_B, 5)).toEqual([{ ...MATE, cantidad: 1 }]);
  });

  it('quita, cuenta unidades y lista slugs sin repetir', () => {
    expect(quitarDelPedido(pedido, ID_B)).toEqual([{ ...MATE, cantidad: 3 }]);
    expect(contarUnidades(pedido)).toBe(4);
    expect(obtenerSlugsDelPedido([...pedido, { ...MATE, varianteId: ID_B, cantidad: 1 }])).toEqual([
      'mate-imperial',
      'termo-acero',
    ]);
  });
});

describe('leerPedidoGuardado', () => {
  it('devuelve vacío si no hay nada o el JSON está roto', () => {
    expect(leerPedidoGuardado(null)).toEqual([]);
    expect(leerPedidoGuardado('{no es json')).toEqual([]);
    expect(leerPedidoGuardado('{"a":1}')).toEqual([]);
  });

  it('descarta líneas inválidas, une duplicados y no copia campos extra', () => {
    const texto = JSON.stringify([
      { ...MATE, cantidad: 2 },
      { ...MATE, cantidad: 3, precio: 1 },
      { varianteId: '../../admin', productoSlug: 'mate', cantidad: 1 },
      { ...TERMO, productoSlug: '<script>', cantidad: 1 },
      { ...TERMO, cantidad: -5 },
      { ...TERMO, cantidad: '10' },
      null,
    ]);
    expect(leerPedidoGuardado(texto)).toEqual([{ ...MATE, cantidad: 5 }]);
  });
});
