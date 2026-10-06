import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdministradorAutenticado, PeticionAutenticada } from '../auth.tipos';

/** Decorador de parámetro: entrega al controlador el administrador que inició sesión. */
export const AdministradorActual = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext): AdministradorAutenticado => {
    const peticion = contexto.switchToHttp().getRequest<PeticionAutenticada>();

    if (!peticion.administrador) {
      throw new UnauthorizedException('Tenés que iniciar sesión.');
    }
    return peticion.administrador;
  },
);
