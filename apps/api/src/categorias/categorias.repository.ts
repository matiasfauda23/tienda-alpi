import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import {
  CAMPOS_CATEGORIA,
  CategoriaResumen,
  DatosActualizarCategoria,
  DatosNuevaCategoria,
} from './categoria.tipos';

/** Acceso a la tabla de categorías. Solo consultas, sin reglas de negocio. */
@Injectable()
export class CategoriasRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista las categorías ordenadas; si soloActivas es true, excluye las ocultas. */
  listar(soloActivas: boolean): Promise<CategoriaResumen[]> {
    return this.prisma.categoria.findMany({
      where: soloActivas ? { activa: true } : undefined,
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: CAMPOS_CATEGORIA,
    });
  }

  /** Busca una categoría por su id; devuelve null si no existe. */
  buscarPorId(id: string): Promise<CategoriaResumen | null> {
    return this.prisma.categoria.findUnique({ where: { id }, select: CAMPOS_CATEGORIA });
  }

  /** Busca una categoría por su slug; devuelve null si no existe. */
  buscarPorSlug(slug: string): Promise<CategoriaResumen | null> {
    return this.prisma.categoria.findUnique({ where: { slug }, select: CAMPOS_CATEGORIA });
  }

  /** Indica si otra categoría ya usa ese slug (opcionalmente ignorando una por su id). */
  async existeSlug(slug: string, idExcluido?: string): Promise<boolean> {
    const cantidad = await this.prisma.categoria.count({
      where: { slug, ...(idExcluido && { NOT: { id: idExcluido } }) },
    });
    return cantidad > 0;
  }

  /** Guarda una categoría nueva y la devuelve. */
  crear(datos: DatosNuevaCategoria): Promise<CategoriaResumen> {
    return this.prisma.categoria.create({ data: datos, select: CAMPOS_CATEGORIA });
  }

  /** Actualiza los campos indicados de una categoría y la devuelve. */
  actualizar(id: string, datos: DatosActualizarCategoria): Promise<CategoriaResumen> {
    return this.prisma.categoria.update({ where: { id }, data: datos, select: CAMPOS_CATEGORIA });
  }

  /** Borra una categoría por su id. */
  async eliminar(id: string): Promise<void> {
    await this.prisma.categoria.delete({ where: { id } });
  }

  /** Cuenta cuántos productos pertenecen a una categoría. */
  contarProductos(id: string): Promise<number> {
    return this.prisma.producto.count({ where: { categoriaId: id } });
  }
}
