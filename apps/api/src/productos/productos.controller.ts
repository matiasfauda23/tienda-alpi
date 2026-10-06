import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginaDeResultados } from '../comun/paginacion';
import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';
import { ProductoDetalle } from './producto.tipos';
import { ProductosService } from './productos.service';

/** Endpoints públicos de productos, para el sitio web. */
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /**
   * GET /api/productos → catálogo con filtros opcionales. Ejemplo:
   * ?categoria=mates,termos&buscar=acero&precioMin=5000&precioMax=20000&orden=precio-asc&pagina=1&porPagina=12
   */
  @Get()
  listar(@Query() query: ListarProductosQueryDto): Promise<PaginaDeResultados<ProductoDetalle>> {
    return this.productosService.listarPublicos(query);
  }

  /** GET /api/productos/:slug → detalle de un producto visible. */
  @Get(':slug')
  obtenerPorSlug(@Param('slug') slug: string): Promise<ProductoDetalle> {
    return this.productosService.obtenerPublicoPorSlug(slug);
  }
}
