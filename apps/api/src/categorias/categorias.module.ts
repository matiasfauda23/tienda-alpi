import { Module } from '@nestjs/common';
import { CategoriasAdminController } from './categorias-admin.controller';
import { CategoriasController } from './categorias.controller';
import { CategoriasRepository } from './categorias.repository';
import { CategoriasService } from './categorias.service';

/** Agrupa todo lo relacionado con categorías. Exporta el servicio para que lo use productos. */
@Module({
  controllers: [CategoriasController, CategoriasAdminController],
  providers: [CategoriasService, CategoriasRepository],
  exports: [CategoriasService],
})
export class CategoriasModule {}
