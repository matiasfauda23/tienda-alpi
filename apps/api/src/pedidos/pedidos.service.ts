import { BadRequestException, Injectable } from '@nestjs/common';
import { calcularPedido, ItemPedido, ResultadoPedido } from '@tienda-alpi/precios';
import { EscalasService } from '../escalas/escalas.service';
import { CalcularPedidoDto, ItemPedidoDto } from './dto/calcular-pedido.dto';
import { ItemPedidoCalculado, PedidoCalculado, VarianteParaCalculo } from './pedido.tipos';
import { PedidosRepository } from './pedidos.repository';

/** Calcula el precio de un pedido aplicando las escalas por cantidad. */
@Injectable()
export class PedidosService {
  constructor(
    private readonly repositorio: PedidosRepository,
    private readonly escalasService: EscalasService,
  ) {}

  /** Calcula el pedido con los precios guardados en la base (nunca con precios que mande el cliente). */
  async calcular(dto: CalcularPedidoDto): Promise<PedidoCalculado> {
    const cantidades = this.agruparCantidadesPorVariante(dto.items);

    const variantes = await this.repositorio.buscarVariantesParaCalcular([...cantidades.keys()]);
    const variantesPorId = new Map(variantes.map((variante) => [variante.id, variante]));
    this.verificarQueExistanTodas([...cantidades.keys()], variantesPorId);

    const escalas = await this.escalasService.obtenerParaCalculo();

    // Mantiene el orden en que el cliente agregó los productos
    const items: ItemPedido[] = [...cantidades.entries()].flatMap(([varianteId, cantidad]) => {
      const variante = variantesPorId.get(varianteId);
      return variante ? [this.convertirEnItemDePedido(variante, cantidad)] : [];
    });

    const resultado = calcularPedido(items, escalas);
    return this.armarRespuesta(resultado, variantesPorId);
  }

  /** Suma las cantidades si una misma variante aparece en más de un renglón. */
  private agruparCantidadesPorVariante(items: ItemPedidoDto[]): Map<string, number> {
    const cantidades = new Map<string, number>();

    for (const item of items) {
      cantidades.set(item.varianteId, (cantidades.get(item.varianteId) ?? 0) + item.cantidad);
    }
    return cantidades;
  }

  /** Verifica que todas las variantes pedidas existan y estén visibles. */
  private verificarQueExistanTodas(ids: string[], variantesPorId: Map<string, VarianteParaCalculo>): void {
    const faltantes = ids.filter((id) => !variantesPorId.has(id));

    if (faltantes.length > 0) {
      throw new BadRequestException(
        `Estos productos no existen o ya no están disponibles: ${faltantes.join(', ')}.`,
      );
    }
  }

  /** Convierte una variante de la base en el formato que espera el paquete de precios. */
  private convertirEnItemDePedido(variante: VarianteParaCalculo, cantidad: number): ItemPedido {
    return {
      varianteId: variante.id,
      cantidad,
      precioBase: variante.precio,
      precioOferta: variante.precioOferta,
      preciosFijosPorEscala: Object.fromEntries(
        variante.preciosFijos.map((precioFijo) => [precioFijo.escalaId, precioFijo.precioUnitario]),
      ),
    };
  }

  /** Suma al resultado del cálculo los datos de cada producto y el aviso de stock. */
  private armarRespuesta(
    resultado: ResultadoPedido,
    variantesPorId: Map<string, VarianteParaCalculo>,
  ): PedidoCalculado {
    const items: ItemPedidoCalculado[] = resultado.items.flatMap((item) => {
      const variante = variantesPorId.get(item.varianteId);
      if (!variante) {
        return [];
      }

      return [
        {
          varianteId: variante.id,
          sku: variante.sku,
          producto: variante.producto.nombre,
          productoSlug: variante.producto.slug,
          variante: variante.nombre,
          colorHex: variante.colorHex,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          stockDisponible: variante.stock,
          superaStock: item.cantidad > variante.stock,
        },
      ];
    });

    return {
      items,
      totalUnidades: resultado.totalUnidades,
      escalaAplicada: resultado.escalaAplicada,
      siguienteEscala: resultado.siguienteEscala,
      unidadesParaSiguienteEscala: resultado.unidadesParaSiguienteEscala,
      totalPrecioLista: resultado.totalPrecioLista,
      total: resultado.total,
      ahorro: resultado.ahorro,
    };
  }
}
