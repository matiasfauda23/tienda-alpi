import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';
import { calcularSalto } from '../comun/paginacion';
import { CAMPOS_REGISTRO, DatosRegistroAuditoria, RegistroAuditoriaResumen } from './auditoria.tipos';

/** Acceso a la tabla de registros de auditoría. */
@Injectable()
export class AuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Guarda un registro (los datos enviados van en la columna "despues"). */
  async crear(registro: DatosRegistroAuditoria): Promise<void> {
    const { datos, ...resto } = registro;
    await this.prisma.registroAuditoria.create({ data: { ...resto, despues: datos } });
  }

  /** Lista los registros del más nuevo al más viejo, paginados. */
  async listar(pagina: number, porPagina: number): Promise<{ items: RegistroAuditoriaResumen[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.registroAuditoria.findMany({
        orderBy: { creadoEn: 'desc' },
        skip: calcularSalto(pagina, porPagina),
        take: porPagina,
        select: CAMPOS_REGISTRO,
      }),
      this.prisma.registroAuditoria.count(),
    ]);
    return { items, total };
  }
}
