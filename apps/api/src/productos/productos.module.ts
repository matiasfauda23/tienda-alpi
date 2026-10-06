import { Module } from '@nestjs/common';
import { CategoriasModule } from '../categorias/categorias.module';
import { ProductosAdminController } from './productos-admin.controller';
import { ProductosController } from './productos.controller';
import { ProductosRepository } from './productos.repository';
import { ProductosService } from './productos.service';
import { EscalasModule } from '../escalas/escalas.module';

/** Agrupa todo lo de productos. Importa CategoriasModule para usar CategoriasService. */
@Module({
  imports: [CategoriasModule, EscalasModule],
  controllers: [ProductosController, ProductosAdminController],
  providers: [ProductosService, ProductosRepository],
  exports: [ProductosService],
})
export class ProductosModule {}
