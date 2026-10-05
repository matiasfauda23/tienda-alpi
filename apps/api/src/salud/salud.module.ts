import { Module } from '@nestjs/common';
import { SaludController } from './salud.controller';
import { SaludService } from './salud.service';

/** Agrupa el controlador y el servicio del chequeo de salud. */
@Module({
  controllers: [SaludController],
  providers: [SaludService],
})
export class SaludModule {}
