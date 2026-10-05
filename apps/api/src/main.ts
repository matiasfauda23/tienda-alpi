import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Arranca la API con el prefijo /api, apagado ordenado y el puerto definido en el entorno. */
async function iniciarAplicacion(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const puerto = app.get(ConfigService).get<number>('PORT', 3001);
  await app.listen(puerto);
}

void iniciarAplicacion();
