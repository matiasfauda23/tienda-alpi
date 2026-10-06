import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CategoriaResumen } from './categoria.tipos';
import { CategoriasRepository } from './categorias.repository';
import { CategoriasService } from './categorias.service';

const CATEGORIA_MATES: CategoriaResumen = {
  id: '11111111-1111-4111-8111-111111111111',
  nombre: 'Mates',
  slug: 'mates',
  orden: 0,
  activa: true,
};

/** Crea un repositorio simulado: cada función es un jest.fn() que el test configura. */
function crearRepositorioSimulado() {
  return {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorSlug: jest.fn(),
    existeSlug: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
    contarProductos: jest.fn(),
  };
}

describe('CategoriasService', () => {
  let servicio: CategoriasService;
  let repositorio: ReturnType<typeof crearRepositorioSimulado>;

  // Antes de cada test arma un servicio nuevo con un repositorio simulado limpio
  beforeEach(async () => {
    repositorio = crearRepositorioSimulado();
    const modulo = await Test.createTestingModule({
      providers: [CategoriasService, { provide: CategoriasRepository, useValue: repositorio }],
    }).compile();
    servicio = modulo.get(CategoriasService);
  });

  describe('crear', () => {
    it('genera el slug a partir del nombre', async () => {
      repositorio.existeSlug.mockResolvedValue(false);
      repositorio.crear.mockResolvedValue({ ...CATEGORIA_MATES, nombre: 'Mates Térmicos' });

      await servicio.crear({ nombre: 'Mates Térmicos' });

      expect(repositorio.crear).toHaveBeenCalledWith({
        nombre: 'Mates Térmicos',
        slug: 'mates-termicos',
      });
    });

    it('rechaza un nombre que ya existe', async () => {
      repositorio.existeSlug.mockResolvedValue(true);

      await expect(servicio.crear({ nombre: 'Mates' })).rejects.toThrow(ConflictException);
      expect(repositorio.crear).not.toHaveBeenCalled();
    });
  });

  describe('obtenerPublicaPorSlug', () => {
    it('devuelve la categoría si está activa', async () => {
      repositorio.buscarPorSlug.mockResolvedValue(CATEGORIA_MATES);

      await expect(servicio.obtenerPublicaPorSlug('mates')).resolves.toEqual(CATEGORIA_MATES);
    });

    it('responde 404 si la categoría está oculta', async () => {
      repositorio.buscarPorSlug.mockResolvedValue({ ...CATEGORIA_MATES, activa: false });

      await expect(servicio.obtenerPublicaPorSlug('mates')).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('regenera el slug cuando cambia el nombre', async () => {
      repositorio.buscarPorId.mockResolvedValue(CATEGORIA_MATES);
      repositorio.existeSlug.mockResolvedValue(false);

      await servicio.actualizar(CATEGORIA_MATES.id, { nombre: 'Mates de Acero' });

      expect(repositorio.actualizar).toHaveBeenCalledWith(CATEGORIA_MATES.id, {
        nombre: 'Mates de Acero',
        slug: 'mates-de-acero',
      });
    });

    it('no toca el slug si solo cambia el orden', async () => {
      repositorio.buscarPorId.mockResolvedValue(CATEGORIA_MATES);

      await servicio.actualizar(CATEGORIA_MATES.id, { orden: 3 });

      expect(repositorio.actualizar).toHaveBeenCalledWith(CATEGORIA_MATES.id, { orden: 3 });
    });
  });

  describe('eliminar', () => {
    it('elimina una categoría sin productos', async () => {
      repositorio.buscarPorId.mockResolvedValue(CATEGORIA_MATES);
      repositorio.contarProductos.mockResolvedValue(0);

      await servicio.eliminar(CATEGORIA_MATES.id);

      expect(repositorio.eliminar).toHaveBeenCalledWith(CATEGORIA_MATES.id);
    });

    it('no elimina una categoría con productos', async () => {
      repositorio.buscarPorId.mockResolvedValue(CATEGORIA_MATES);
      repositorio.contarProductos.mockResolvedValue(5);

      await expect(servicio.eliminar(CATEGORIA_MATES.id)).rejects.toThrow(ConflictException);
      expect(repositorio.eliminar).not.toHaveBeenCalled();
    });

    it('responde 404 si la categoría no existe', async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servicio.eliminar(CATEGORIA_MATES.id)).rejects.toThrow(NotFoundException);
    });
  });
});
