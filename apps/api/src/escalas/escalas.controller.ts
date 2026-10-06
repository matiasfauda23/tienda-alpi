import { Controller, Get } from '@nestjs/common';
import { EscalaResumen } from './escala.tipos';
import { EscalasService } from './escalas.service';

/** Endpoint público de escalas: el sitio las muestra como tabla de precios por cantidad. */
@Controller('escalas')
export class EscalasController {
  constructor(private readonly escalasService: EscalasService) {}

  /** GET /api/escalas → lista las escalas de menor a mayor. */
  @Get()
  listar(): Promise<EscalaResumen[]> {
    return this.escalasService.listar();
  }
}
