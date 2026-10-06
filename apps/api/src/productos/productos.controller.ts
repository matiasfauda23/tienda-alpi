import { Controller, Get, Param } from '@nestjs/common';
import { ProductoDetalle } from './producto.tipos';
import { ProductosService } from './productos.service';

/** Endpoints públicos de productos, para el sitio web. */
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /** GET /api/productos/:slug → detalle de un producto visible. */
  @Get(':slug')
  obtenerPorSlug(@Param('slug') slug: string): Promise<ProductoDetalle> {
    return this.productosService.obtenerPublicoPorSlug(slug);
  }
}
