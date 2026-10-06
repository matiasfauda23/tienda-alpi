import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NoAuditar } from '../auditoria/no-auditar.decorator';
import type { AdministradorAutenticado } from '../auth/auth.tipos';
import { AdministradorActual } from '../auth/decoradores/administrador-actual.decorator';
import { ComparacionPlanilla, ResultadoImportacion } from './planilla.tipos';
import type { ArchivoSubido } from './planilla.tipos';
import { PlanillasService } from './planillas.service';

/** Límites del archivo subido: un solo archivo de hasta 2 MB (si se pasa, Nest responde 413). */
const OPCIONES_SUBIDA = { limits: { fileSize: 2 * 1024 * 1024, files: 1 } };

/** Tipo de contenido de un archivo .xlsx. */
const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Endpoints del panel para exportar e importar precios y stock (requieren sesión iniciada). */
@Controller('admin/planillas')
export class PlanillasAdminController {
  constructor(private readonly planillasService: PlanillasService) {}

  /** GET /api/admin/planillas/exportar → descarga la planilla con todas las variantes. */
  @Get('exportar')
  async exportar(): Promise<StreamableFile> {
    const contenido = await this.planillasService.exportar();
    const fecha = new Date().toISOString().slice(0, 10);

    return new StreamableFile(contenido, {
      type: TIPO_XLSX,
      disposition: `attachment; filename="tienda-alpi-precios-${fecha}.xlsx"`,
    });
  }

  /** POST /api/admin/planillas/vista-previa → muestra qué cambiaría, sin guardar nada. */
  @NoAuditar() // No cambia nada
  @Post('vista-previa')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_SUBIDA))
  vistaPrevia(@UploadedFile() archivo: ArchivoSubido | undefined): Promise<ComparacionPlanilla> {
    return this.planillasService.vistaPrevia(archivo);
  }

  /** POST /api/admin/planillas/aplicar → guarda todos los cambios de la planilla, o ninguno si hay errores. */
  @NoAuditar() // Se registra a mano en el servicio, con el detalle de cada cambio
  @Post('aplicar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_SUBIDA))
  aplicar(
    @UploadedFile() archivo: ArchivoSubido | undefined,
    @AdministradorActual() administrador: AdministradorAutenticado,
    @Ip() ip: string,
  ): Promise<ResultadoImportacion> {
    return this.planillasService.aplicar(archivo, administrador, ip);
  }
}
