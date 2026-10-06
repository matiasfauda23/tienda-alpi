import { Injectable } from '@nestjs/common';
import { PaginacionQueryDto } from '../comun/dto/paginacion-query.dto';
import { PaginaDeResultados } from '../comun/paginacion';
import { DatosRegistroAuditoria, RegistroAuditoriaResumen } from './auditoria.tipos';
import { AuditoriaRepository } from './auditoria.repository';

/** Guarda y consulta el historial de cambios del panel. */
@Injectable()
export class AuditoriaService {
  constructor(private readonly repositorio: AuditoriaRepository) {}

  /** Guarda un cambio hecho desde el panel. */
  registrar(registro: DatosRegistroAuditoria): Promise<void> {
    return this.repositorio.crear(registro);
  }

  /** Devuelve el historial paginado, del cambio más nuevo al más viejo. */
  async listar(query: PaginacionQueryDto): Promise<PaginaDeResultados<RegistroAuditoriaResumen>> {
    const { items, total } = await this.repositorio.listar(query.pagina, query.porPagina);

    return {
      items,
      total,
      pagina: query.pagina,
      porPagina: query.porPagina,
      totalPaginas: Math.ceil(total / query.porPagina),
    };
  }
}
