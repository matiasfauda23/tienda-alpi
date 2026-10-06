import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import { calcularSalto } from '../comun/paginacion';
import { Prisma } from '../generated/prisma/client';
import {
  CAMPOS_PRODUCTO,
  CAMPOS_VARIANTE,
  CamposDerivados,
  DatosActualizarProducto,
  DatosActualizarVariante,
  DatosNuevoProducto,
  DatosVariante,
  DatosPrecioFijo,
  FiltrosCatalogo,
  OrdenCatalogo,
  ProductoDetalle,
} from './producto.tipos';

/** Cómo se traduce cada opción de orden a Prisma. El "id" del final hace estable la paginación. */
const ORDEN_CATALOGO: Record<OrdenCatalogo, Prisma.ProductoOrderByWithRelationInput[]> = {
  recientes: [{ creadoEn: 'desc' }, { id: 'asc' }],
  'precio-asc': [{ precioDesde: 'asc' }, { nombre: 'asc' }, { id: 'asc' }],
  'precio-desc': [{ precioDesde: 'desc' }, { nombre: 'asc' }, { id: 'asc' }],
  nombre: [{ nombre: 'asc' }, { id: 'asc' }],
};

/** Traduce los filtros del catálogo a una condición de Prisma. Solo incluye productos y categorías visibles. */
function construirFiltroCatalogo(filtros: FiltrosCatalogo): Prisma.ProductoWhereInput {
  const where: Prisma.ProductoWhereInput = { activo: true, categoria: { activa: true } };

  if (filtros.categorias.length > 0) {
    where.categoria = { activa: true, slug: { in: filtros.categorias } };
  }
  if (filtros.texto) {
    where.textoBusqueda = { contains: filtros.texto };
  }
  if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) {
    where.precioDesde = { gte: filtros.precioMin, lte: filtros.precioMax };
  }
  if (filtros.soloDestacados) {
    where.destacado = true;
  }

  return where;
}

/** Acceso a las tablas de productos y variantes. Solo consultas, sin reglas de negocio. */
@Injectable()
export class ProductosRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista todos los productos, del más nuevo al más viejo (para el panel). */
  listar(): Promise<ProductoDetalle[]> {
    return this.prisma.producto.findMany({
      orderBy: { creadoEn: 'desc' },
      select: CAMPOS_PRODUCTO,
    });
  }

  /** Busca productos visibles con filtros, orden y paginación; devuelve la página y el total. */
  async listarPublicos(filtros: FiltrosCatalogo): Promise<{ items: ProductoDetalle[]; total: number }> {
    const where = construirFiltroCatalogo(filtros);

    // Las dos consultas se ejecutan juntas, en una misma transacción
    const [items, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        orderBy: ORDEN_CATALOGO[filtros.orden],
        skip: calcularSalto(filtros.pagina, filtros.porPagina),
        take: filtros.porPagina,
        select: CAMPOS_PRODUCTO,
      }),
      this.prisma.producto.count({ where }),
    ]);

    return { items, total };
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

  /** Guarda los campos calculados de un producto (precio desde y texto de búsqueda). */
  async actualizarCamposDerivados(id: string, campos: CamposDerivados): Promise<void> {
    await this.prisma.producto.update({ where: { id }, data: campos });
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
  /** Reemplaza todos los precios fijos de una variante, en una sola transacción. */
  async reemplazarPreciosFijos(varianteId: string, precios: DatosPrecioFijo[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.precioFijoEscala.deleteMany({ where: { varianteId } }),
      this.prisma.precioFijoEscala.createMany({
        data: precios.map((precio) => ({ ...precio, varianteId })),
      }),
    ]);
  }
}
