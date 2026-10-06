import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DURACION_ACCESO_SEGUNDOS, DURACION_REFRESH_SEGUNDOS } from './auth.constantes';
import { AdministradorAutenticado, ParDeTokens, PayloadToken } from './auth.tipos';

/** Firma y verifica los tokens JWT de la sesión. */
@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly configuracion: ConfigService,
  ) {}

  /** Genera un token de acceso y uno de refresh para un administrador. */
  async generarPar(administrador: AdministradorAutenticado): Promise<ParDeTokens> {
    const payload: PayloadToken = { sub: administrador.id, email: administrador.email };

    const [acceso, refresh] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.obtenerSecreto('JWT_SECRETO_ACCESO'),
        expiresIn: DURACION_ACCESO_SEGUNDOS,
      }),
      // El "jti" aleatorio hace que cada refresh token sea único, aunque se generen en el mismo segundo
      this.jwt.signAsync(
        { ...payload, jti: randomUUID() },
        { secret: this.obtenerSecreto('JWT_SECRETO_REFRESH'), expiresIn: DURACION_REFRESH_SEGUNDOS },
      ),
    ]);

    return { acceso, refresh };
  }

  /** Verifica un token de acceso; si es inválido o venció, responde 401. */
  verificarAcceso(token: string): Promise<AdministradorAutenticado> {
    return this.verificar(token, 'JWT_SECRETO_ACCESO');
  }

  /** Verifica un token de refresh; si es inválido o venció, responde 401. */
  verificarRefresh(token: string): Promise<AdministradorAutenticado> {
    return this.verificar(token, 'JWT_SECRETO_REFRESH');
  }

  /** Comprueba la firma y la fecha de vencimiento de un token y devuelve a quién pertenece. */
  private async verificar(token: string, variableSecreto: string): Promise<AdministradorAutenticado> {
    try {
      const payload = await this.jwt.verifyAsync<PayloadToken>(token, {
        secret: this.obtenerSecreto(variableSecreto),
      });
      return { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('La sesión expiró o no es válida.');
    }
  }

  /** Lee un secreto del entorno (la app no arranca si falta, ver validar-entorno.ts). */
  private obtenerSecreto(variable: string): string {
    return this.configuracion.getOrThrow<string>(variable);
  }
}
