import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CategoriasService } from '../categorias/categorias.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ProductoDetalle } from './producto.tipos';
import { ProductosRepository } from './productos.repository';
import { ProductosService } from './productos.service';

const ID_CATEGORIA = '11111111-1111-4111-8111-111111111111';
const ID_PRODUCTO = '22222222-2222-4222-8222-222222222222';
const ID_VARIANTE = '33333333-3333-4333-8333-333333333333';

const PRODUCTO: ProductoDetalle = {
  id: ID_PRODUCTO,
  nombre: 'Mate Imperial',
  slug: 'mate-imperial',
  descripcion: '',
  destacado: false,
  nuevo: false,
  activo: true,
  categoria: { id: ID_CATEGORIA, nombre: 'Mates', slug: 'mates', activa: true },
  variantes: [],
};

const VARIANTE = {
  id: ID_VARIANTE,
  productoId: ID_PRODUCTO,
  sku: 'MATE-IMP-NEGRO',
  nombre: 'Negro',
  colorHex: null,
  precio: 10000,
  precioOferta: null,
  stock: 10,
  orden: 0,
};

/** Arma un DTO de producto válido con dos variantes. */
function crearDtoValido(): CrearProductoDto {
  return {
    nombre: 'Mate Imperial',
    categoriaId: ID_CATEGORIA,
    variantes: [
      { sku: 'MATE-IMP-NEGRO', nombre: 'Negro', precio: 10000, stock: 10 },
      { sku: 'MATE-IMP-VERDE', nombre: 'Verde', precio: 10000, stock: 5 },
    ],
  };
}

/** Repositorio simulado: cada función es un jest.fn() que el test configura. */
function crearRepositorioSimulado() {
  return {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorSlug: jest.fn(),
    existeSlug: jest.fn(),
    skusEnUso: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    buscarVariante: jest.fn(),
    agregarVariante: jest.fn(),
    actualizarVariante: jest.fn(),
    eliminarVariante: jest.fn(),
    contarVariantes: jest.fn(),
  };
}

describe('ProductosService', () => {
  let servicio: ProductosService;
  let repositorio: ReturnType<typeof crearRepositorioSimulado>;
  let categoriasService: { verificarQueExiste: jest.Mock };

  beforeEach(async () => {
    repositorio = crearRepositorioSimulado();
    categoriasService = { verificarQueExiste: jest.fn().mockResolvedValue(undefined) };

    const modulo = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: ProductosRepository, useValue: repositorio },
        { provide: CategoriasService, useValue: categoriasService },
      ],
    }).compile();

    servicio = modulo.get(ProductosService);
  });

  describe('crear', () => {
    it('crea el producto con su slug cuando todo es válido', async () => {
      repositorio.skusEnUso.mockResolvedValue([]);
      repositorio.existeSlug.mockResolvedValue(false);
      repositorio.crear.mockResolvedValue(PRODUCTO);

      await servicio.crear(crearDtoValido());

      expect(repositorio.crear).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'mate-imperial', categoriaId: ID_CATEGORIA }),
      );
    });

    it('rechaza una categoría que no existe', async () => {
      categoriasService.verificarQueExiste.mockRejectedValue(new NotFoundException());

      await expect(servicio.crear(crearDtoValido())).rejects.toThrow(NotFoundException);
      expect(repositorio.crear).not.toHaveBeenCalled();
    });

    it('rechaza un precio de oferta mayor o igual al precio', async () => {
      const dto = crearDtoValido();
      dto.variantes[0].precioOferta = 10000;

      await expect(servicio.crear(dto)).rejects.toThrow(BadRequestException);
    });

    it('rechaza SKU repetidos dentro del mismo producto', async () => {
      const dto = crearDtoValido();
      dto.variantes[1].sku = 'MATE-IMP-NEGRO';

      await expect(servicio.crear(dto)).rejects.toThrow(BadRequestException);
    });

    it('rechaza SKU que ya usa otra variante', async () => {
      repositorio.skusEnUso.mockResolvedValue(['MATE-IMP-VERDE']);

      await expect(servicio.crear(crearDtoValido())).rejects.toThrow(ConflictException);
    });
  });

  describe('obtenerPublicoPorSlug', () => {
    it('responde 404 si el producto está oculto', async () => {
      repositorio.buscarPorSlug.mockResolvedValue({ ...PRODUCTO, activo: false });

      await expect(servicio.obtenerPublicoPorSlug('mate-imperial')).rejects.toThrow(NotFoundException);
    });

    it('responde 404 si la categoría del producto está oculta', async () => {
      repositorio.buscarPorSlug.mockResolvedValue({
        ...PRODUCTO,
        categoria: { ...PRODUCTO.categoria, activa: false },
      });

      await expect(servicio.obtenerPublicoPorSlug('mate-imperial')).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarVariante', () => {
    it('valida la oferta contra el precio guardado si no se manda un precio nuevo', async () => {
      repositorio.buscarVariante.mockResolvedValue(VARIANTE);

      await expect(
        servicio.actualizarVariante(ID_PRODUCTO, ID_VARIANTE, { precioOferta: 12000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('responde 404 si la variante es de otro producto', async () => {
      repositorio.buscarVariante.mockResolvedValue({ ...VARIANTE, productoId: 'otro-producto' });

      await expect(
        servicio.actualizarVariante(ID_PRODUCTO, ID_VARIANTE, { stock: 3 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminarVariante', () => {
    it('no permite borrar la única variante', async () => {
      repositorio.buscarVariante.mockResolvedValue(VARIANTE);
      repositorio.contarVariantes.mockResolvedValue(1);

      await expect(servicio.eliminarVariante(ID_PRODUCTO, ID_VARIANTE)).rejects.toThrow(
        ConflictException,
      );
      expect(repositorio.eliminarVariante).not.toHaveBeenCalled();
    });

    it('borra la variante si quedan otras', async () => {
      repositorio.buscarVariante.mockResolvedValue(VARIANTE);
      repositorio.contarVariantes.mockResolvedValue(3);

      await servicio.eliminarVariante(ID_PRODUCTO, ID_VARIANTE);

      expect(repositorio.eliminarVariante).toHaveBeenCalledWith(ID_VARIANTE);
    });
  });
});
