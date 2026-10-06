import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import { CAMPOS_ESCALA, DatosEscala, EscalaResumen } from './escala.tipos';

/** Acceso a la tabla de escalas de precio. */
@Injectable()
export class EscalasRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista las escalas de menor a mayor cantidad mínima. */
  listar(): Promise<EscalaResumen[]> {
    return this.prisma.escalaPrecio.findMany({
      orderBy: { cantidadMinima: 'asc' },
      select: CAMPOS_ESCALA,
    });
  }

  /**
   * Deja guardada exactamente la lista recibida, en una sola transacción:
   * borra las que faltan, actualiza las que tienen id y crea las nuevas.
   */
  reemplazarTodas(escalas: DatosEscala[]): Promise<EscalaResumen[]> {
    const existentes = escalas.filter((escala): escala is DatosEscala & { id: string } => Boolean(escala.id));
    const nuevas = escalas.filter((escala) => !escala.id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Borra las escalas que ya no están en la lista
      await tx.escalaPrecio.deleteMany({
        where: { id: { notIn: existentes.map((escala) => escala.id) } },
      });

      // 2. Pasa las que quedan a cantidades temporales negativas. Así, si se intercambian
      //    dos valores, no chocan con la regla de "cantidadMinima única" a mitad de camino.
      for (const [indice, escala] of existentes.entries()) {
        await tx.escalaPrecio.update({
          where: { id: escala.id },
          data: { cantidadMinima: -(indice + 1) },
        });
      }

      // 3. Guarda los valores definitivos de las existentes
      for (const { id, ...datos } of existentes) {
        await tx.escalaPrecio.update({ where: { id }, data: datos });
      }

      // 4. Crea las nuevas
      if (nuevas.length > 0) {
        await tx.escalaPrecio.createMany({ data: nuevas });
      }

      return tx.escalaPrecio.findMany({ orderBy: { cantidadMinima: 'asc' }, select: CAMPOS_ESCALA });
    });
  }
}
