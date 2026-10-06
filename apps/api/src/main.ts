import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

/** Arranca la API con seguridad básica, validación global, prefijo /api y apagado ordenado. */
async function iniciarAplicacion(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuracion = app.get(ConfigService);

  configurarSeguridad(app, configuracion);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  await app.listen(configuracion.get<number>('PORT', 3001));
}

/** Aplica cabeceras de seguridad, CORS restringido al frontend y validación de todos los datos de entrada. */
function configurarSeguridad(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
  configuracion: ConfigService,
): void {
  // Cabeceras HTTP que protegen contra ataques comunes del navegador
  app.use(helmet());

  // Solo el frontend puede llamar a la API desde un navegador
  app.enableCors({
    origin: configuracion.get<string>('URL_FRONTEND', 'http://localhost:3000'),
    credentials: true,
  });

  // Valida cada petición con los DTOs:
  // whitelist: descarta campos que no están en el DTO
  // forbidNonWhitelisted: si mandan campos de más, responde 400
  // transform: convierte el JSON recibido en una instancia del DTO
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}

void iniciarAplicacion();
