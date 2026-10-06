import { Controller, Get, Param } from '@nestjs/common';
import { CategoriaResumen } from './categoria.tipos';
import { CategoriasService } from './categorias.service';

/** Endpoints públicos de categorías, para el sitio web. */
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  /** GET /api/categorias → lista las categorías visibles. */
  @Get()
  listar(): Promise<CategoriaResumen[]> {
    return this.categoriasService.listarPublicas();
  }

  /** GET /api/categorias/:slug → devuelve una categoría visible por su slug. */
  @Get(':slug')
  obtenerPorSlug(@Param('slug') slug: string): Promise<CategoriaResumen> {
    return this.categoriasService.obtenerPublicaPorSlug(slug);
  }
}
