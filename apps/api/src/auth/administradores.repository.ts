import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';

/** Acceso a la tabla de administradores del panel. */
@Injectable()
export class AdministradoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca un administrador por email, con el hash de su contraseña (solo para verificarla). */
  buscarPorEmail(email: string) {
    return this.prisma.administrador.findUnique({
      where: { email },
      select: { id: true, email: true, hashContrasena: true },
    });
  }

  /** Busca un administrador por id, con el hash del refresh token vigente. */
  buscarPorId(id: string) {
    return this.prisma.administrador.findUnique({
      where: { id },
      select: { id: true, email: true, hashRefreshToken: true },
    });
  }

  /** Registra un inicio de sesión: guarda la fecha y el hash del nuevo refresh token. */
  async registrarIngreso(id: string, hashRefreshToken: string): Promise<void> {
    await this.prisma.administrador.update({
      where: { id },
      data: { ultimoIngresoEn: new Date(), hashRefreshToken },
    });
  }

  /** Guarda el hash del refresh token vigente; con null, invalida la sesión. */
  async guardarHashRefresh(id: string, hashRefreshToken: string | null): Promise<void> {
    await this.prisma.administrador.update({ where: { id }, data: { hashRefreshToken } });
  }
}
