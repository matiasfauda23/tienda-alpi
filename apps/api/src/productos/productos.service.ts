import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriasService } from '../categorias/categorias.service';
import { PaginaDeResultados } from '../comun/paginacion';
import { generarSlug } from '../comun/utilidades/slug';
import { normalizarTexto } from '../comun/utilidades/texto';
import { calcularCamposDerivados } from './campos-derivados';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { ActualizarVarianteDto } from './dto/actualizar-variante.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { CrearVarianteDto } from './dto/crear-variante.dto';
import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';
import { FiltrosCatalogo, ProductoDetalle } from './producto.tipos';
import { ProductosRepository } from './productos.repository';
import { EscalasService } from '../escalas/escalas.service';
import { ReemplazarPreciosFijosDto } from './dto/reemplazar-precios-fijos.dto';
import { buscarErrorEnPreciosPorEscala } from './precios-por-escala';

/** Reglas de negocio de los productos y sus variantes. */
@Injectable()
export class ProductosService {
  constructor(
    private readonly repositorio: ProductosRepository,
      private readonly categoriasService: CategoriasService,
    private readonly escalasService: EscalasService,
  ) {}

  /** Lista los productos visibles del catálogo con filtros, búsqueda, orden y paginación. */
  async listarPublicos(query: ListarProductosQueryDto): Promise<PaginaDeResultados<ProductoDetalle>> {
    this.validarRangoDePrecios(query.precioMin, query.precioMax);

    const filtros = this.construirFiltros(query);
    const { items, total } = await this.repositorio.listarPublicos(filtros);

    return {
      items,
      total,
      pagina: filtros.pagina,
      porPagina: filtros.porPagina,
      totalPaginas: Math.ceil(total / filtros.porPagina),
    };
  }

  /** Devuelve todos los productos, incluidos los ocultos (para el panel). */
  listarParaAdmin(): Promise<ProductoDetalle[]> {
    return this.repositorio.listar();
  }

  /** Devuelve un producto por id para el panel; si no existe, responde 404. */
  obtenerParaAdmin(id: string): Promise<ProductoDetalle> {
    return this.obtenerPorIdOFallar(id);
  }

  /** Devuelve un producto visible por su slug; si él o su categoría están ocultos, responde 404. */
  async obtenerPublicoPorSlug(slug: string): Promise<ProductoDetalle> {
    const producto = await this.repositorio.buscarPorSlug(slug);

    if (!producto || !producto.activo || !producto.categoria.activa) {
      throw new NotFoundException('El producto no existe.');
    }
    return producto;
  }

  /** Crea un producto con sus variantes, validando categoría, precios y SKU. */
  async crear(dto: CrearProductoDto): Promise<ProductoDetalle> {
    await this.categoriasService.verificarQueExiste(dto.categoriaId);

    dto.variantes.forEach((variante) => this.validarPrecioOferta(variante.precio, variante.precioOferta));

    const skus = dto.variantes.map((variante) => variante.sku);
    this.verificarSkusSinRepetir(skus);
    await this.verificarSkusLibres(skus);

    const slug = await this.generarSlugDisponible(dto.nombre);
    const producto = await this.repositorio.crear({ ...dto, slug });
    return this.sincronizarCamposDerivados(producto.id);
  }

  /** Modifica los datos de un producto; si cambia el nombre, también cambia su slug. */
  async actualizar(id: string, dto: ActualizarProductoDto): Promise<ProductoDetalle> {
    await this.obtenerPorIdOFallar(id);

    if (dto.categoriaId) {
      await this.categoriasService.verificarQueExiste(dto.categoriaId);
    }

    const datos = dto.nombre
      ? { ...dto, slug: await this.generarSlugDisponible(dto.nombre, id) }
      : dto;

    await this.repositorio.actualizar(id, datos);
    return this.sincronizarCamposDerivados(id);
  }

  /** Agrega una variante a un producto existente y devuelve el producto actualizado. */
  async agregarVariante(productoId: string, dto: CrearVarianteDto): Promise<ProductoDetalle> {
    await this.obtenerPorIdOFallar(productoId);

    this.validarPrecioOferta(dto.precio, dto.precioOferta);
    await this.verificarSkusLibres([dto.sku]);

    await this.repositorio.agregarVariante(productoId, dto);
    return this.sincronizarCamposDerivados(productoId);
  }

  /** Modifica una variante y devuelve el producto actualizado. */
  async actualizarVariante(
    productoId: string,
    varianteId: string,
    dto: ActualizarVarianteDto,
  ): Promise<ProductoDetalle> {
    const variante = await this.obtenerVarianteDelProducto(productoId, varianteId);

    // Combina lo que llega con lo guardado para validar el resultado final
    const precioFinal = dto.precio ?? variante.precio;
    const ofertaFinal = dto.precioOferta === undefined ? variante.precioOferta : dto.precioOferta;
    this.validarPrecioOferta(precioFinal, ofertaFinal);

    if (dto.sku && dto.sku !== variante.sku) {
      await this.verificarSkusLibres([dto.sku], varianteId);
    }

    await this.repositorio.actualizarVariante(varianteId, dto);
    return this.sincronizarCamposDerivados(productoId);
  }

  /** Elimina una variante, salvo que sea la única del producto. */
  async eliminarVariante(productoId: string, varianteId: string): Promise<void> {
    await this.obtenerVarianteDelProducto(productoId, varianteId);

    const cantidadVariantes = await this.repositorio.contarVariantes(productoId);
    if (cantidadVariantes <= 1) {
      throw new ConflictException(
        'Un producto debe tener al menos una variante. Ocultá el producto en lugar de borrarla.',
      );
    }

    await this.repositorio.eliminarVariante(varianteId);
    await this.sincronizarCamposDerivados(productoId);
  }
  /** Reemplaza los precios fijos de una variante, verificando que comprar más nunca salga más caro. */
  async reemplazarPreciosFijos(
    productoId: string,
    varianteId: string,
    dto: ReemplazarPreciosFijosDto,
  ): Promise<ProductoDetalle> {
    const variante = await this.obtenerVarianteDelProducto(productoId, varianteId);
    const escalas = await this.escalasService.listar();

    this.validarPreciosFijos(variante.precio, escalas, dto);

    await this.repositorio.reemplazarPreciosFijos(varianteId, dto.precios);
    return this.obtenerPorIdOFallar(productoId);
  }

  /** Recalcula y guarda el precio "desde" y el texto de búsqueda; devuelve el producto actualizado. */
  private async sincronizarCamposDerivados(productoId: string): Promise<ProductoDetalle> {
    const producto = await this.obtenerPorIdOFallar(productoId);
    const campos = calcularCamposDerivados(producto);

    await this.repositorio.actualizarCamposDerivados(productoId, campos);
    return { ...producto, precioDesde: campos.precioDesde };
  }

  /** Convierte los filtros que llegan por la URL en filtros listos para la base. */
  private construirFiltros(query: ListarProductosQueryDto): FiltrosCatalogo {
    const texto = query.buscar ? normalizarTexto(query.buscar) : '';

    return {
      categorias: query.categoria ?? [],
      texto: texto || undefined,
      precioMin: query.precioMin,
      precioMax: query.precioMax,
      soloDestacados: query.destacados ?? false,
      orden: query.orden,
      pagina: query.pagina,
      porPagina: query.porPagina,
    };
  }

  /** Verifica que el precio mínimo no sea mayor que el máximo. */
  private validarRangoDePrecios(precioMin?: number, precioMax?: number): void {
    if (precioMin !== undefined && precioMax !== undefined && precioMin > precioMax) {
      throw new BadRequestException('El precio mínimo no puede ser mayor que el máximo.');
    }
  }

  /** Busca un producto por id; si no existe, responde 404. */
  private async obtenerPorIdOFallar(id: string): Promise<ProductoDetalle> {
    const producto = await this.repositorio.buscarPorId(id);

    if (!producto) {
      throw new NotFoundException('El producto no existe.');
    }
    return producto;
  }

  /** Busca una variante y verifica que pertenezca a ese producto; si no, responde 404. */
  private async obtenerVarianteDelProducto(productoId: string, varianteId: string) {
    const variante = await this.repositorio.buscarVariante(varianteId);

    if (!variante || variante.productoId !== productoId) {
      throw new NotFoundException('La variante no existe en este producto.');
    }
    return variante;
  }

  /** Verifica que el precio de oferta, si existe, sea menor que el precio normal. */
  private validarPrecioOferta(precio: number, precioOferta?: number | null): void {
    if (precioOferta != null && precioOferta >= precio) {
      throw new BadRequestException(
        `El precio de oferta ($${precioOferta}) debe ser menor que el precio ($${precio}).`,
      );
    }
  }

  /** Verifica que las escalas existan, no se repitan y que el precio por unidad nunca suba con la cantidad. */
  private validarPreciosFijos(
    precioBase: number,
    escalas: { id: string; nombre: string; cantidadMinima: number; porcentajeDescuento: number }[],
    dto: ReemplazarPreciosFijosDto,
  ): void {
    const idsEnviados = dto.precios.map((precio) => precio.escalaId);
    if (new Set(idsEnviados).size !== idsEnviados.length) {
      throw new BadRequestException('Hay una escala repetida en los precios fijos.');
    }

    const idsExistentes = new Set(escalas.map((escala) => escala.id));
    const desconocidas = idsEnviados.filter((id) => !idsExistentes.has(id));
    if (desconocidas.length > 0) {
      throw new BadRequestException(`Estas escalas no existen: ${desconocidas.join(', ')}.`);
    }

    const preciosFijos = new Map(dto.precios.map((precio) => [precio.escalaId, precio.precioUnitario]));
    const error = buscarErrorEnPreciosPorEscala(precioBase, escalas, preciosFijos);
    if (error) {
      throw new BadRequestException(error);
    }
  }

  /** Verifica que no se repita un SKU dentro de la misma lista de variantes. */
  private verificarSkusSinRepetir(skus: string[]): void {
    const repetidos = skus.filter((sku, indice) => skus.indexOf(sku) !== indice);

    if (repetidos.length > 0) {
      throw new BadRequestException(`SKU repetido en las variantes: ${[...new Set(repetidos)].join(', ')}.`);
    }
  }

  /** Verifica que ninguna otra variante de la base use esos SKU. */
  private async verificarSkusLibres(skus: string[], varianteIdExcluida?: string): Promise<void> {
    const enUso = await this.repositorio.skusEnUso(skus, varianteIdExcluida);

    if (enUso.length > 0) {
      throw new ConflictException(`Estos SKU ya están en uso: ${enUso.join(', ')}.`);
    }
  }

  /** Genera el slug de un nombre y verifica que ningún otro producto lo use. */
  private async generarSlugDisponible(nombre: string, idExcluido?: string): Promise<string> {
    const slug = generarSlug(nombre);

    if (!slug) {
      throw new BadRequestException('El nombre debe contener letras o números.');
    }
    if (await this.repositorio.existeSlug(slug, idExcluido)) {
      throw new ConflictException(`Ya existe un producto llamado "${nombre}".`);
    }
    return slug;
  }
}
