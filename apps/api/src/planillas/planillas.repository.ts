import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import { CambioVariante } from './planilla.tipos';

/** Consultas de la exportación e importación de planillas. */
@Injectable()
export class PlanillasRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista todas las variantes con su producto y categoría, en el orden de la planilla. */
  listarVariantes() {
    return this.prisma.variante.findMany({
      orderBy: [
        { producto: { categoria: { nombre: 'asc' } } },
        { producto: { nombre: 'asc' } },
        { orden: 'asc' },
      ],
      select: {
        id: true,
        sku: true,
        nombre: true,
        precio: true,
        precioOferta: true,
        stock: true,
        productoId: true,
        producto: { select: { nombre: true, categoria: { select: { nombre: true } } } },
      },
    });
  }

  /** Aplica todos los cambios en una sola transacción: o se guardan todos, o ninguno. */
  async aplicarCambios(cambios: CambioVariante[]): Promise<void> {
    await this.prisma.$transaction(
      cambios.map((cambio) =>
        this.prisma.variante.update({ where: { id: cambio.varianteId }, data: cambio.despues }),
      ),
    );
  }
}
