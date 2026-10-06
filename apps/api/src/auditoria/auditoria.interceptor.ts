import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PeticionAutenticada } from '../auth/auth.tipos';
import { armarRegistro } from './armar-registro';
import { AuditoriaService } from './auditoria.service';

/** Métodos HTTP que modifican datos. */
const METODOS_QUE_MODIFICAN = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Solo se auditan los cambios hechos desde el panel. */
const PREFIJO_ADMIN = '/api/admin/';

/** Interceptor global: cuando un cambio del panel termina bien, lo guarda en la auditoría. */
@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditoriaInterceptor.name);

  constructor(private readonly auditoriaService: AuditoriaService) {}

  /** Deja pasar la petición y, si fue un cambio del panel que salió bien, lo registra. */
  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    const peticion = contexto.switchToHttp().getRequest<PeticionAutenticada>();

    if (!this.esCambioDelPanel(peticion)) {
      return siguiente.handle();
    }

    // "tap" se ejecuta con la respuesta, después del controlador, sin modificarla
    return siguiente.handle().pipe(
      tap((respuesta: unknown) => {
        this.auditoriaService.registrar(armarRegistro(peticion, respuesta)).catch((error: unknown) => {
          // Si falla la auditoría no se rompe la respuesta: queda en los logs del servidor
          this.logger.error(
            'No se pudo guardar el registro de auditoría',
            error instanceof Error ? error.stack : String(error),
          );
        });
      }),
    );
  }

  /** Indica si la petición modifica datos del panel. */
  private esCambioDelPanel(peticion: PeticionAutenticada): boolean {
    return METODOS_QUE_MODIFICAN.has(peticion.method) && peticion.originalUrl.startsWith(PREFIJO_ADMIN);
  }
}
