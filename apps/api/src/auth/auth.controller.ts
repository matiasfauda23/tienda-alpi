import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { COOKIE_REFRESH } from './auth.constantes';
import type { AdministradorAutenticado } from './auth.tipos';
import { AuthService } from './auth.service';
import { borrarCookiesDeSesion, guardarCookiesDeSesion } from './cookies';
import { AdministradorActual } from './decoradores/administrador-actual.decorator';
import { Publico } from './decoradores/publico.decorator';
import { LoginDto } from './dto/login.dto';

/** Endpoints para iniciar, renovar y cerrar la sesión del panel. */
@Controller('auth')
export class AuthController {
  private readonly esProduccion: boolean;

  constructor(
    private readonly authService: AuthService,
    configuracion: ConfigService,
  ) {
    this.esProduccion = configuracion.get<string>('NODE_ENV') === 'production';
  }

  /** POST /api/auth/login → valida email y contraseña y guarda la sesión en cookies. Máximo 5 intentos cada 15 minutos. */
  @Publico()
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) respuesta: Response,
  ): Promise<AdministradorAutenticado> {
    const { administrador, tokens } = await this.authService.iniciarSesion(dto.email, dto.contrasena);
    guardarCookiesDeSesion(respuesta, tokens, this.esProduccion);
    return administrador;
  }

  /** POST /api/auth/refrescar → cambia el refresh token por un par nuevo. */
  @Publico()
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(
    @Req() peticion: Request,
    @Res({ passthrough: true }) respuesta: Response,
  ): Promise<AdministradorAutenticado> {
    const tokenRefresh = peticion.cookies?.[COOKIE_REFRESH] as string | undefined;
    const { administrador, tokens } = await this.authService.refrescarSesion(tokenRefresh);
    guardarCookiesDeSesion(respuesta, tokens, this.esProduccion);
    return administrador;
  }

  /** POST /api/auth/salir → cierra la sesión y borra las cookies. */
  @Publico()
  @Post('salir')
  @HttpCode(HttpStatus.NO_CONTENT)
  async salir(@Req() peticion: Request, @Res({ passthrough: true }) respuesta: Response): Promise<void> {
    const tokenRefresh = peticion.cookies?.[COOKIE_REFRESH] as string | undefined;
    await this.authService.cerrarSesion(tokenRefresh);
    borrarCookiesDeSesion(respuesta, this.esProduccion);
  }

  /** GET /api/auth/yo → datos del administrador con sesión iniciada (el panel lo usa para saber si está logueado). */
  @Get('yo')
  obtenerPerfil(@AdministradorActual() administrador: AdministradorAutenticado): AdministradorAutenticado {
    return administrador;
  }
}
