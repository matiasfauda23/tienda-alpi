import { Controller, Get, Query } from '@nestjs/common';
import { PaginacionQueryDto } from '../comun/dto/paginacion-query.dto';
import { PaginaDeResultados } from '../comun/paginacion';
import { RegistroAuditoriaResumen } from './auditoria.tipos';
import { AuditoriaService } from './auditoria.service';

/** Historial de cambios del panel (requiere sesión iniciada). */
@Controller('admin/auditoria')
export class AuditoriaAdminController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /** GET /api/admin/auditoria?pagina=1&porPagina=20 → últimos cambios, del más nuevo al más viejo. */
  @Get()
  listar(@Query() query: PaginacionQueryDto): Promise<PaginaDeResultados<RegistroAuditoriaResumen>> {
    return this.auditoriaService.listar(query);
  }
}
