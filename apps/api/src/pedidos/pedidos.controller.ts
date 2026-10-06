import { Publico } from '../auth/decoradores/publico.decorator';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CalcularPedidoDto } from './dto/calcular-pedido.dto';
import { PedidoCalculado } from './pedido.tipos';
import { PedidosService } from './pedidos.service';

/** Endpoints públicos del armador de pedido. */
@Publico()
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /** POST /api/pedidos/calcular → calcula escala, precios, total y ahorro de un pedido. */
  @Post('calcular')
  @HttpCode(HttpStatus.OK)
  calcular(@Body() dto: CalcularPedidoDto): Promise<PedidoCalculado> {
    return this.pedidosService.calcular(dto);
  }
}
