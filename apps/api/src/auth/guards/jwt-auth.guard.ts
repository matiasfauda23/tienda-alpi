import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COOKIE_ACCESO } from '../auth.constantes';
import { PeticionAutenticada } from '../auth.tipos';
import { CLAVE_PUBLICO } from '../decoradores/publico.decorator';
import { TokensService } from '../tokens.service';

/** Guard global: todo endpoint exige sesión iniciada, salvo los marcados con @Publico(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokensService,
  ) {}

  /** Deja pasar los endpoints públicos; en los demás, valida el token de acceso de la cookie. */
  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(CLAVE_PUBLICO, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (esPublico) {
      return true;
    }

    const peticion = contexto.switchToHttp().getRequest<PeticionAutenticada>();
    const token = peticion.cookies?.[COOKIE_ACCESO] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Tenés que iniciar sesión.');
    }

    // Si el token es válido, queda disponible para @AdministradorActual()
    peticion.administrador = await this.tokens.verificarAcceso(token);
    return true;
  }
}
