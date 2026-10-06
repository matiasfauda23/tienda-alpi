import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ErrorDePreciosFilter } from './comun/filtros/error-de-precios.filter';

/** Arranca la API con seguridad básica, validación global, prefijo /api y apagado ordenado. */
async function iniciarAplicacion(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuracion = app.get(ConfigService);

  configurarSeguridad(app, configuracion);

  // Traduce los errores del paquete de precios a respuestas 400
  app.useGlobalFilters(new ErrorDePreciosFilter());

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  await app.listen(configuracion.get<number>('PORT', 3001));
}

/** Aplica cabeceras de seguridad, lectura de cookies, CORS restringido y validación de los datos de entrada. */
function configurarSeguridad(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
  configuracion: ConfigService,
): void {
  // Cabeceras HTTP que protegen contra ataques comunes del navegador
  app.use(helmet());

  // Lee las cookies de cada petición (ahí viajan los tokens de sesión)
  app.use(cookieParser());

  // Solo el frontend puede llamar a la API desde un navegador, y puede mandar cookies
  app.enableCors({
    origin: configuracion.get<string>('URL_FRONTEND', 'http://localhost:3000'),
    credentials: true,
  });

  // Valida cada petición con los DTOs: descarta campos de más y convierte los datos al tipo del DTO
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}

void iniciarAplicacion();
