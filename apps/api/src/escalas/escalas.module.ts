import { Module } from '@nestjs/common';
import { EscalasAdminController } from './escalas-admin.controller';
import { EscalasController } from './escalas.controller';
import { EscalasRepository } from './escalas.repository';
import { EscalasService } from './escalas.service';

/** Agrupa todo lo de escalas. Exporta el servicio para que pedidos pueda calcular precios. */
@Module({
  controllers: [EscalasController, EscalasAdminController],
  providers: [EscalasService, EscalasRepository],
  exports: [EscalasService],
})
export class EscalasModule {}
