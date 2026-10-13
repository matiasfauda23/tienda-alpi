import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { RevalidacionService } from './revalidacion.service';
import { CLAVE_REVALIDACION, type EtiquetaCache } from './revalidar.decorator';

/** Después de un cambio exitoso en un endpoint marcado con @Revalidar, avisa a la web. */
@Injectable()
export class RevalidacionInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly revalidacion: RevalidacionService,
  ) {}

  /** Deja pasar el pedido y, si cambió datos y salió bien, dispara el aviso sin demorar la respuesta. */
  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    const etiquetas = this.reflector.getAllAndOverride<EtiquetaCache[] | undefined>(CLAVE_REVALIDACION, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    const metodo = contexto.switchToHttp().getRequest<{ method: string }>().method;
    if (!etiquetas?.length || metodo === 'GET') return siguiente.handle();

    return siguiente.handle().pipe(
      tap(() => {
        void this.revalidacion.avisar(etiquetas);
      }),
    );
  }
}
