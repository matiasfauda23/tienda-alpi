import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EscalasService } from '../escalas/escalas.service';
import { VarianteParaCalculo } from './pedido.tipos';
import { PedidosRepository } from './pedidos.repository';
import { PedidosService } from './pedidos.service';

const ID_NEGRO = '55555555-5555-4555-8555-555555555555';
const ID_VERDE = '66666666-6666-4666-8666-666666666666';

const ESCALAS = [
  { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

/** Crea una variante de prueba con valores por defecto que se pueden pisar. */
function crearVariante(id: string, datos: Partial<VarianteParaCalculo> = {}): VarianteParaCalculo {
  return {
    id,
    sku: `SKU-${id.slice(0, 4)}`,
    nombre: 'Negro',
    colorHex: null,
    precio: 10000,
    precioOferta: null,
    stock: 1000,
    producto: { nombre: 'Mate de Acero', slug: 'mate-de-acero' },
    preciosFijos: [],
    ...datos,
  };
}

describe('PedidosService', () => {
  let servicio: PedidosService;
  let repositorio: { buscarVariantesParaCalcular: jest.Mock };

  beforeEach(async () => {
    repositorio = { buscarVariantesParaCalcular: jest.fn() };
    const escalasService = { obtenerParaCalculo: jest.fn().mockResolvedValue(ESCALAS) };

    const modulo = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: PedidosRepository, useValue: repositorio },
        { provide: EscalasService, useValue: escalasService },
      ],
    }).compile();

    servicio = modulo.get(PedidosService);
  });

  it('suma productos distintos para elegir la escala (60 + 40 = 100)', async () => {
    repositorio.buscarVariantesParaCalcular.mockResolvedValue([
      crearVariante(ID_NEGRO),
      crearVariante(ID_VERDE, { nombre: 'Verde' }),
    ]);

    const pedido = await servicio.calcular({
      items: [
        { varianteId: ID_NEGRO, cantidad: 60 },
        { varianteId: ID_VERDE, cantidad: 40 },
      ],
    });

    expect(pedido.escalaAplicada?.id).toBe('e2');
    expect(pedido.items.map((item) => item.precioUnitario)).toEqual([9000, 9000]);
    expect(pedido.total).toBe(900000);
    expect(pedido.ahorro).toBe(100000);
  });

  it('junta las cantidades si la misma variante viene repetida', async () => {
    repositorio.buscarVariantesParaCalcular.mockResolvedValue([crearVariante(ID_NEGRO)]);

    const pedido = await servicio.calcular({
      items: [
        { varianteId: ID_NEGRO, cantidad: 60 },
        { varianteId: ID_NEGRO, cantidad: 40 },
      ],
    });

    expect(pedido.items).toHaveLength(1);
    expect(pedido.items[0].cantidad).toBe(100);
  });

  it('usa el precio fijo de la escala cuando la variante lo tiene', async () => {
    repositorio.buscarVariantesParaCalcular.mockResolvedValue([
      crearVariante(ID_NEGRO, { preciosFijos: [{ escalaId: 'e2', precioUnitario: 8500 }] }),
    ]);

    const pedido = await servicio.calcular({ items: [{ varianteId: ID_NEGRO, cantidad: 100 }] });

    expect(pedido.items[0].precioUnitario).toBe(8500);
  });

  it('avisa cuando la cantidad pedida supera el stock', async () => {
    repositorio.buscarVariantesParaCalcular.mockResolvedValue([crearVariante(ID_NEGRO, { stock: 50 })]);

    const pedido = await servicio.calcular({ items: [{ varianteId: ID_NEGRO, cantidad: 60 }] });

    expect(pedido.items[0].superaStock).toBe(true);
  });

  it('rechaza variantes que no existen o están ocultas', async () => {
    repositorio.buscarVariantesParaCalcular.mockResolvedValue([]);

    await expect(
      servicio.calcular({ items: [{ varianteId: ID_NEGRO, cantidad: 1 }] }),
    ).rejects.toThrow(BadRequestException);
  });
});
