import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AdministradoresRepository } from './administradores.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OrigenPermitidoGuard } from './guards/origen-permitido.guard';
import { TokensService } from './tokens.service';

/** Autenticación del panel. Registra los guards globales: origen permitido y sesión obligatoria. */
@Module({
  // Los secretos se pasan en cada firma (ver TokensService), por eso la configuración va vacía
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    AdministradoresRepository,
    { provide: APP_GUARD, useClass: OrigenPermitidoGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
