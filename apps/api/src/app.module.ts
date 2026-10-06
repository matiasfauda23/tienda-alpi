import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BaseDeDatosModule } from './base-de-datos/base-de-datos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { validarEntorno } from './configuracion/validar-entorno';
import { EscalasModule } from './escalas/escalas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ContenidoModule } from './contenido/contenido.module';
import { ProductosModule } from './productos/productos.module';
import { AuthModule } from './auth/auth.module';
import { SaludModule } from './salud/salud.module';

/** Módulo raíz: configuración, límite de peticiones y módulos de la API. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }),
    // Máximo 100 peticiones por minuto por IP (el login tendrá un límite más estricto)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    BaseDeDatosModule,
    AuthModule,
    SaludModule,
    CategoriasModule,
    ProductosModule,
    EscalasModule,
    PedidosModule,
    ContenidoModule,
  ],
  providers: [
    // Aplica el límite de peticiones a todos los endpoints
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
