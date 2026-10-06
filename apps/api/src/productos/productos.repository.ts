import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import {
  CAMPOS_PRODUCTO,
  CAMPOS_VARIANTE,
  DatosActualizarProducto,
  DatosActualizarVariante,
  DatosNuevoProducto,
  DatosVariante,
  ProductoDetalle,
} from './producto.tipos';

/** Acceso a las tablas de productos y variantes. Solo consultas, sin reglas de negocio. */
@Injectable()
export class ProductosRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista todos los productos, del más nuevo al más viejo. */
  listar(): Promise<ProductoDetalle[]> {
    return this.prisma.producto.findMany({
      orderBy: { creadoEn: 'desc' },
      select: CAMPOS_PRODUCTO,
    });
  }

  /** Busca un producto por su id; devuelve null si no existe. */
  buscarPorId(id: string): Promise<ProductoDetalle | null> {
    return this.prisma.producto.findUnique({ where: { id }, select: CAMPOS_PRODUCTO });
  }

  /** Busca un producto por su slug; devuelve null si no existe. */
  buscarPorSlug(slug: string): Promise<ProductoDetalle | null> {
    return this.prisma.producto.findUnique({ where: { slug }, select: CAMPOS_PRODUCTO });
  }

  /** Indica si otro producto ya usa ese slug (opcionalmente ignorando uno por su id). */
  async existeSlug(slug: string, idExcluido?: string): Promise<boolean> {
    const cantidad = await this.prisma.producto.count({
      where: { slug, ...(idExcluido && { NOT: { id: idExcluido } }) },
    });
    return cantidad > 0;
  }

  /** Devuelve cuáles de esos SKU ya están usados por alguna variante (opcionalmente ignorando una). */
  async skusEnUso(skus: string[], varianteIdExcluida?: string): Promise<string[]> {
    const variantes = await this.prisma.variante.findMany({
      where: { sku: { in: skus }, ...(varianteIdExcluida && { NOT: { id: varianteIdExcluida } }) },
      select: { sku: true },
    });
    return variantes.map((variante) => variante.sku);
  }

  /** Guarda un producto con todas sus variantes en una sola operación (todo o nada). */
  crear(datos: DatosNuevoProducto): Promise<ProductoDetalle> {
    const { variantes, ...producto } = datos;
    return this.prisma.producto.create({
      data: { ...producto, variantes: { create: variantes } },
      select: CAMPOS_PRODUCTO,
    });
  }

  /** Actualiza los campos indicados de un producto y lo devuelve. */
  actualizar(id: string, datos: DatosActualizarProducto): Promise<ProductoDetalle> {
    return this.prisma.producto.update({ where: { id }, data: datos, select: CAMPOS_PRODUCTO });
  }

  /** Busca una variante por su id, incluyendo a qué producto pertenece. */
  buscarVariante(id: string) {
    return this.prisma.variante.findUnique({
      where: { id },
      select: { ...CAMPOS_VARIANTE, productoId: true },
    });
  }

  /** Agrega una variante nueva a un producto. */
  async agregarVariante(productoId: string, datos: DatosVariante): Promise<void> {
    await this.prisma.variante.create({ data: { ...datos, productoId } });
  }

  /** Actualiza los campos indicados de una variante. */
  async actualizarVariante(id: string, datos: DatosActualizarVariante): Promise<void> {
    await this.prisma.variante.update({ where: { id }, data: datos });
  }

  /** Borra una variante por su id. */
  async eliminarVariante(id: string): Promise<void> {
    await this.prisma.variante.delete({ where: { id } });
  }

  /** Cuenta cuántas variantes tiene un producto. */
  contarVariantes(productoId: string): Promise<number> {
    return this.prisma.variante.count({ where: { productoId } });
  }
}
