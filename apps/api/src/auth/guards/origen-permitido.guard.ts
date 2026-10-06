import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/** Métodos que solo leen datos: no hace falta controlar de dónde vienen. */
const METODOS_DE_LECTURA = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Guard global contra CSRF: rechaza peticiones que modifican datos si un navegador las manda desde otro sitio. */
@Injectable()
export class OrigenPermitidoGuard implements CanActivate {
  private readonly origenPermitido: string;

  constructor(configuracion: ConfigService) {
    this.origenPermitido = configuracion.get<string>('URL_FRONTEND', 'http://localhost:3000');
  }

  /** Permite lecturas siempre; en escrituras, si hay cabecera Origin, tiene que ser la del frontend. */
  canActivate(contexto: ExecutionContext): boolean {
    const peticion = contexto.switchToHttp().getRequest<Request>();
    if (METODOS_DE_LECTURA.has(peticion.method)) {
      return true;
    }

    // Sin Origin no es un navegador (curl, Postman): esas peticiones igual necesitan iniciar sesión
    const origen = peticion.headers.origin;
    if (!origen || origen === this.origenPermitido) {
      return true;
    }

    throw new ForbiddenException('Origen no permitido.');
  }
}
