import { Publico } from '../auth/decoradores/publico.decorator';
import { Controller, Get } from '@nestjs/common';
import { EstadoSalud, SaludService } from './salud.service';

/** Expone el chequeo de salud en GET /api/salud. */
@Publico()
@Controller('salud')
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  /** Informa si la API y la base de datos están funcionando. */
  @Get()
  obtenerEstado(): Promise<EstadoSalud> {
    return this.saludService.obtenerEstado();
  }
}
