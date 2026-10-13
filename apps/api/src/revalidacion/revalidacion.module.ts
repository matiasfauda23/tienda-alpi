import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RevalidacionInterceptor } from './revalidacion.interceptor';
import { RevalidacionService } from './revalidacion.service';

/** Avisa a la web cuando cambian datos, para que la tienda muestre los cambios al instante. */
@Module({
  imports: [ConfigModule],
  providers: [RevalidacionService, { provide: APP_INTERCEPTOR, useClass: RevalidacionInterceptor }],
})
export class RevalidacionModule {}
