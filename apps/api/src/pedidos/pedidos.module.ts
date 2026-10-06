import { Module } from '@nestjs/common';
import { EscalasModule } from '../escalas/escalas.module';
import { PedidosController } from './pedidos.controller';
import { PedidosRepository } from './pedidos.repository';
import { PedidosService } from './pedidos.service';

/** Agrupa el cálculo de pedidos. Importa EscalasModule para obtener las escalas vigentes. */
@Module({
  imports: [EscalasModule],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosRepository],
})
export class PedidosModule {}
