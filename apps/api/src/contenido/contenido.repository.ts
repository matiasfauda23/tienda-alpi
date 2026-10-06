import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { ClaveContenido } from './contenido.tipos';

/** Acceso a la tabla de contenido del sitio (una fila por sección). */
@Injectable()
export class ContenidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Devuelve todas las secciones guardadas. */
  listar() {
    return this.prisma.contenidoSitio.findMany({ select: { clave: true, valor: true } });
  }

  /** Crea o reemplaza una sección. */
  async guardar(clave: ClaveContenido, valor: Prisma.InputJsonObject): Promise<void> {
    await this.prisma.contenidoSitio.upsert({
      where: { clave },
      create: { clave, valor },
      update: { valor },
    });
  }
}
