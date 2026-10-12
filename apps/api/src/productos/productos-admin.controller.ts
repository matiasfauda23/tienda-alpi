import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { ActualizarVarianteDto } from './dto/actualizar-variante.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { CrearVarianteDto } from './dto/crear-variante.dto';
import { ReemplazarPreciosFijosDto } from './dto/reemplazar-precios-fijos.dto';
import { ProductoDetalle } from './producto.tipos';
import { ProductosService } from './productos.service';

/** Endpoints del panel para administrar productos y variantes (protegidos por el guard global de JWT). */
@Controller('admin/productos')
export class ProductosAdminController {
  constructor(private readonly productosService: ProductosService) {}

  /** GET /api/admin/productos → lista todos, incluidos los ocultos. */
  @Get()
  listar(): Promise<ProductoDetalle[]> {
    return this.productosService.listarParaAdmin();
  }

  /** GET /api/admin/productos/:id → detalle de un producto. */
  @Get(':id')
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<ProductoDetalle> {
    return this.productosService.obtenerParaAdmin(id);
  }

  /** POST /api/admin/productos → crea un producto con sus variantes. */
  @Post()
  crear(@Body() dto: CrearProductoDto): Promise<ProductoDetalle> {
    return this.productosService.crear(dto);
  }

  /** PATCH /api/admin/productos/:id → modifica los datos del producto (para ocultarlo: activo false). */
  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarProductoDto,
  ): Promise<ProductoDetalle> {
    return this.productosService.actualizar(id, dto);
  }

  /** POST /api/admin/productos/:id/variantes → agrega una variante. */
  @Post(':id/variantes')
  agregarVariante(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearVarianteDto,
  ): Promise<ProductoDetalle> {
    return this.productosService.agregarVariante(id, dto);
  }

  /** PATCH /api/admin/productos/:id/variantes/:varianteId → modifica precio, stock, etc. */
  @Patch(':id/variantes/:varianteId')
  actualizarVariante(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('varianteId', ParseUUIDPipe) varianteId: string,
    @Body() dto: ActualizarVarianteDto,
  ): Promise<ProductoDetalle> {
    return this.productosService.actualizarVariante(id, varianteId, dto);
  }

  /** PUT /api/admin/productos/:id/variantes/:varianteId/precios-fijos → reemplaza los precios fijos por escala. */
  @Put(':id/variantes/:varianteId/precios-fijos')
  reemplazarPreciosFijos(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('varianteId', ParseUUIDPipe) varianteId: string,
    @Body() dto: ReemplazarPreciosFijosDto,
  ): Promise<ProductoDetalle> {
    return this.productosService.reemplazarPreciosFijos(id, varianteId, dto);
  }

  /** DELETE /api/admin/productos/:id/variantes/:varianteId → elimina una variante. */
  @Delete(':id/variantes/:varianteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminarVariante(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('varianteId', ParseUUIDPipe) varianteId: string,
  ): Promise<void> {
    return this.productosService.eliminarVariante(id, varianteId);
  }
}
