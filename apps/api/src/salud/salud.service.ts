import { Injectable } from '@nestjs/common';
import { PrismaService } from '../base-de-datos/prisma.service';

/** Resultado del chequeo de salud de la API. */
export interface EstadoSalud {
  estado: 'ok' | 'error';
  baseDeDatos: 'ok' | 'error';
  fecha: string;
}

/** Comprueba que la API y la base de datos estén funcionando. */
@Injectable()
export class SaludService {
  constructor(private readonly prisma: PrismaService) {}

  /** Arma el estado general de la API a partir del chequeo de la base. */
  async obtenerEstado(): Promise<EstadoSalud> {
    const baseDeDatos = await this.verificarBaseDeDatos();
    return { estado: baseDeDatos, baseDeDatos, fecha: new Date().toISOString() };
  }

  /** Ejecuta una consulta mínima: devuelve 'ok' si la base responde o 'error' si falla. */
  private async verificarBaseDeDatos(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }
}
