import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/** Cliente de Prisma como servicio de Nest: se conecta al arrancar y se desconecta al apagar. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configuracion: ConfigService) {
    const adaptador = new PrismaPg({
      connectionString: configuracion.getOrThrow<string>('DATABASE_URL'),
    });
    super({ adapter: adaptador });
  }

  /** Abre la conexión con la base cuando arranca la aplicación. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /** Cierra la conexión con la base cuando se apaga la aplicación. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
