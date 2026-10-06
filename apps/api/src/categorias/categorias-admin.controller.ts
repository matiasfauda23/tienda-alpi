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
} from '@nestjs/common';
import { CategoriaResumen } from './categoria.tipos';
import { CategoriasService } from './categorias.service';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';

/**
 * Endpoints del panel para administrar categorías.
 * PENDIENTE: proteger con login (paso de autenticación). No hacer deploy antes.
 */
@Controller('admin/categorias')
export class CategoriasAdminController {
  constructor(private readonly categoriasService: CategoriasService) {}

  /** GET /api/admin/categorias → lista todas, incluidas las ocultas. */
  @Get()
  listarTodas(): Promise<CategoriaResumen[]> {
    return this.categoriasService.listarTodas();
  }

  /** POST /api/admin/categorias → crea una categoría. */
  @Post()
  crear(@Body() dto: CrearCategoriaDto): Promise<CategoriaResumen> {
    return this.categoriasService.crear(dto);
  }

  /** PATCH /api/admin/categorias/:id → modifica una categoría. */
  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCategoriaDto,
  ): Promise<CategoriaResumen> {
    return this.categoriasService.actualizar(id, dto);
  }

  /** DELETE /api/admin/categorias/:id → elimina una categoría sin productos. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriasService.eliminar(id);
  }
}
