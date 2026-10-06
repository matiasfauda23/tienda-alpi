import { Module } from '@nestjs/common';
import { ContenidoAdminController } from './contenido-admin.controller';
import { ContenidoController } from './contenido.controller';
import { ContenidoRepository } from './contenido.repository';
import { ContenidoService } from './contenido.service';

/** Agrupa todo lo del contenido editable del sitio. */
@Module({
  controllers: [ContenidoController, ContenidoAdminController],
  providers: [ContenidoService, ContenidoRepository],
})
export class ContenidoModule {}
