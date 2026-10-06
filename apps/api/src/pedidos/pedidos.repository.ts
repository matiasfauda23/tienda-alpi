import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import { CAMPOS_VARIANTE_PARA_CALCULO, VarianteParaCalculo } from './pedido.tipos';

/** Consultas que necesita el cálculo de pedidos. */
@Injectable()
export class PedidosRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca esas variantes, pero solo si su producto y su categoría están visibles en el sitio. */
  buscarVariantesParaCalcular(ids: string[]): Promise<VarianteParaCalculo[]> {
    return this.prisma.variante.findMany({
      where: {
        id: { in: ids },
        producto: { activo: true, categoria: { activa: true } },
      },
      select: CAMPOS_VARIANTE_PARA_CALCULO,
    });
  }
}
