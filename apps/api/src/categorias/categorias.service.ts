import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generarSlug } from '../comun/utilidades/slug';
import { CategoriaResumen } from './categoria.tipos';
import { CategoriasRepository } from './categorias.repository';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';

/** Reglas de negocio de las categorías. */
@Injectable()
export class CategoriasService {
  constructor(private readonly repositorio: CategoriasRepository) {}

  /** Devuelve las categorías visibles en el sitio público. */
  listarPublicas(): Promise<CategoriaResumen[]> {
    return this.repositorio.listar(true);
  }

  /** Devuelve todas las categorías, incluidas las ocultas (para el panel). */
  listarTodas(): Promise<CategoriaResumen[]> {
    return this.repositorio.listar(false);
  }

  /** Busca una categoría visible por su slug; si no existe o está oculta, responde 404. */
  async obtenerPublicaPorSlug(slug: string): Promise<CategoriaResumen> {
    const categoria = await this.repositorio.buscarPorSlug(slug);

    if (!categoria || !categoria.activa) {
      throw new NotFoundException('La categoría no existe.');
    }
    return categoria;
  }

  /** Crea una categoría generando su slug a partir del nombre. */
  async crear(dto: CrearCategoriaDto): Promise<CategoriaResumen> {
    const slug = await this.generarSlugDisponible(dto.nombre);
    return this.repositorio.crear({ ...dto, slug });
  }

  /** Actualiza una categoría; si cambia el nombre, también cambia su slug. */
  async actualizar(id: string, dto: ActualizarCategoriaDto): Promise<CategoriaResumen> {
    await this.obtenerPorIdOFallar(id);

    const datos = dto.nombre
      ? { ...dto, slug: await this.generarSlugDisponible(dto.nombre, id) }
      : dto;

    return this.repositorio.actualizar(id, datos);
  }

  /** Elimina una categoría solo si no tiene productos; si tiene, hay que ocultarla. */
  async eliminar(id: string): Promise<void> {
    await this.obtenerPorIdOFallar(id);

    const cantidadProductos = await this.repositorio.contarProductos(id);
    if (cantidadProductos > 0) {
      throw new ConflictException(
        `La categoría tiene ${cantidadProductos} producto(s). Ocultala en lugar de eliminarla.`,
      );
    }

    await this.repositorio.eliminar(id);
  }

  /** Busca una categoría por id; si no existe, responde 404. */
  private async obtenerPorIdOFallar(id: string): Promise<CategoriaResumen> {
    const categoria = await this.repositorio.buscarPorId(id);

    if (!categoria) {
      throw new NotFoundException('La categoría no existe.');
    }
    return categoria;
  }

  /** Genera el slug de un nombre y verifica que ninguna otra categoría lo use. */
  private async generarSlugDisponible(nombre: string, idExcluido?: string): Promise<string> {
    const slug = generarSlug(nombre);

    if (!slug) {
      throw new BadRequestException('El nombre debe contener letras o números.');
    }
    if (await this.repositorio.existeSlug(slug, idExcluido)) {
      throw new ConflictException(`Ya existe una categoría llamada "${nombre}".`);
    }
    return slug;
  }
}
