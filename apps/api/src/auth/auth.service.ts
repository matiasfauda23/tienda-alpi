import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verificarContrasena } from '../comun/seguridad/contrasenas';
import { hashearToken, sonIguales } from '../comun/seguridad/hash';
import { AdministradoresRepository } from './administradores.repository';
import { AdministradorAutenticado, ResultadoSesion } from './auth.tipos';
import { TokensService } from './tokens.service';

/** Mensaje único para login fallido: no revela si el email existe o no. */
const MENSAJE_LOGIN_INVALIDO = 'Email o contraseña incorrectos.';

/** Inicia, renueva y cierra las sesiones del panel. */
@Injectable()
export class AuthService {
  constructor(
    private readonly repositorio: AdministradoresRepository,
    private readonly tokens: TokensService,
  ) {}

  /** Verifica email y contraseña; si son correctos, abre una sesión nueva. */
  async iniciarSesion(email: string, contrasena: string): Promise<ResultadoSesion> {
    const encontrado = await this.repositorio.buscarPorEmail(email);
    const contrasenaValida = await verificarContrasena(encontrado?.hashContrasena ?? null, contrasena);

    if (!encontrado || !contrasenaValida) {
      throw new UnauthorizedException(MENSAJE_LOGIN_INVALIDO);
    }

    const administrador: AdministradorAutenticado = { id: encontrado.id, email: encontrado.email };
    const tokens = await this.tokens.generarPar(administrador);

    // Se guarda el hash del refresh, nunca el token real
    await this.repositorio.registrarIngreso(administrador.id, hashearToken(tokens.refresh));
    return { administrador, tokens };
  }

  /** Cambia un refresh token válido por un par nuevo (rotación). Si se reutiliza uno viejo, cierra la sesión. */
  async refrescarSesion(tokenRefresh: string | undefined): Promise<ResultadoSesion> {
    if (!tokenRefresh) {
      throw new UnauthorizedException('No hay una sesión activa.');
    }

    const datos = await this.tokens.verificarRefresh(tokenRefresh);
    const guardado = await this.repositorio.buscarPorId(datos.id);
    const coincide =
      guardado?.hashRefreshToken != null && sonIguales(guardado.hashRefreshToken, hashearToken(tokenRefresh));

    if (!guardado || !coincide) {
      // Un refresh válido pero que no es el vigente ya fue usado: puede ser un robo, se invalida la sesión
      if (guardado) {
        await this.repositorio.guardarHashRefresh(guardado.id, null);
      }
      throw new UnauthorizedException('La sesión no es válida. Iniciá sesión de nuevo.');
    }

    const administrador: AdministradorAutenticado = { id: guardado.id, email: guardado.email };
    const tokens = await this.tokens.generarPar(administrador);
    await this.repositorio.guardarHashRefresh(administrador.id, hashearToken(tokens.refresh));
    return { administrador, tokens };
  }

  /** Cierra la sesión invalidando el refresh token guardado. */
  async cerrarSesion(tokenRefresh: string | undefined): Promise<void> {
    if (!tokenRefresh) {
      return;
    }

    try {
      const datos = await this.tokens.verificarRefresh(tokenRefresh);
      await this.repositorio.guardarHashRefresh(datos.id, null);
    } catch {
      // El token ya venció o no es válido: no hay sesión que invalidar
    }
  }
}
