import { Controller, Get } from '@nestjs/common';
import { Publico } from '../auth/decoradores/publico.decorator';
import { ContenidoSitio } from './contenido.tipos';
import { ContenidoService } from './contenido.service';

/** Endpoint público con todo el contenido editable del sitio. */
@Publico()
@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenidoService: ContenidoService) {}

  /** GET /api/contenido → contacto, banner, preguntas frecuentes y condiciones de venta. */
  @Get()
  obtenerTodo(): Promise<ContenidoSitio> {
    return this.contenidoService.obtenerTodo();
  }
}
