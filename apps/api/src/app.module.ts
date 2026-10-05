import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseDeDatosModule } from './base-de-datos/base-de-datos.module';
import { validarEntorno } from './configuracion/validar-entorno';
import { SaludModule } from './salud/salud.module';

/** Módulo raíz: carga la configuración y une los módulos de la API. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }),
    BaseDeDatosModule,
    SaludModule,
  ],
})
export class AppModule {}
