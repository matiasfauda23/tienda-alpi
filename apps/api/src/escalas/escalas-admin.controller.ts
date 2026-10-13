import { Body, Controller, Put } from '@nestjs/common';
import { ReemplazarEscalasDto } from './dto/reemplazar-escalas.dto';
import { EscalaResumen } from './escala.tipos';
import { EscalasService } from './escalas.service';
import { Revalidar } from '../revalidacion/revalidar.decorator';

/**
 * Endpoint del panel para configurar las escalas.
 */
@Revalidar('escalas')
@Controller('admin/escalas')
export class EscalasAdminController {
  constructor(private readonly escalasService: EscalasService) {}

  /** PUT /api/admin/escalas → reemplaza la lista completa de escalas. */
  @Put()
  reemplazar(@Body() dto: ReemplazarEscalasDto): Promise<EscalaResumen[]> {
    return this.escalasService.reemplazar(dto);
  }
}
