import { describe, expect, it } from 'vitest';
import type { Producto, Variante } from '../api/tipos';
import { armarResumenPedido } from './resumen';

const ESCALAS = [
  { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

/** Crea un producto de prueba con una sola variante. */
function crearProducto(slug: string, variante: Partial<Variante>): Producto {
  return {
    id: `p-${slug}`,
    nombre: slug,
    slug,
    descripcion: '',
    destacado: false,
    nuevo: false,
    activo: true,
    precioDesde: 0,
    categoria: { id: 'c1', nombre: 'Mates', slug: 'mates', activa: true },
    variantes: [
      {
        id: 'v',
        sku: 'SKU',
        nombre: 'Único',
        colorHex: null,
        precio: 1000,
        precioOferta: null,
        stock: 100,
        orden: 0,
        preciosFijos: [],
        ...variante,
      },
    ],
  };
}

const MATE = crearProducto('mate', { id: 'a1', precio: 1000, stock: 200 });
const TERMO = crearProducto('termo', { id: 'b1', precio: 2000, stock: 10 });

describe('armarResumenPedido', () => {
  it('suma unidades de distintos productos para elegir la escala', () => {
    const resumen = armarResumenPedido(
      [
        { varianteId: 'a1', productoSlug: 'mate', cantidad: 90 },
        { varianteId: 'b1', productoSlug: 'termo', cantidad: 20 },
      ],
      [MATE, TERMO],
      ESCALAS,
    );
    expect(resumen?.totalUnidades).toBe(110);
    expect(resumen?.escalaAplicada?.nombre).toBe('Mayorista');
    expect(resumen?.lineas.map((l) => l.precioUnitario)).toEqual([900, 1800]);
    expect(resumen?.total).toBe(117000);
    expect(resumen?.ahorro).toBe(13000);
    expect(resumen?.siguienteEscala?.nombre).toBe('Distribuidor');
    expect(resumen?.unidadesParaSiguienteEscala).toBe(390);
  });

  it('marca las líneas que superan el stock', () => {
    const resumen = armarResumenPedido(
      [{ varianteId: 'b1', productoSlug: 'termo', cantidad: 20 }],
      [TERMO],
      ESCALAS,
    );
    expect(resumen?.lineas[0].superaStock).toBe(true);
  });

  it('separa las variantes que ya no existen', () => {
    const resumen = armarResumenPedido(
      [
        { varianteId: 'a1', productoSlug: 'mate', cantidad: 1 },
        { varianteId: 'borrada', productoSlug: 'mate', cantidad: 5 },
      ],
      [MATE],
      ESCALAS,
    );
    expect(resumen?.noDisponibles).toEqual(['borrada']);
    expect(resumen?.totalUnidades).toBe(1);
  });

  it('devuelve null si no hay escalas configuradas', () => {
    expect(armarResumenPedido([], [MATE], [])).toBeNull();
  });
});
