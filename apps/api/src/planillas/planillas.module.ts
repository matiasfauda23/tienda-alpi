import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ProductosModule } from '../productos/productos.module';
import { PlanillasAdminController } from './planillas-admin.controller';
import { PlanillasRepository } from './planillas.repository';
import { PlanillasService } from './planillas.service';

/** Exportación e importación de precios y stock en planillas de Excel. */
@Module({
  imports: [ProductosModule, AuditoriaModule],
  controllers: [PlanillasAdminController],
  providers: [PlanillasService, PlanillasRepository],
})
export class PlanillasModule {}
