import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditoriaAdminController } from './auditoria-admin.controller';
import { AuditoriaInterceptor } from './auditoria.interceptor';
import { AuditoriaRepository } from './auditoria.repository';
import { AuditoriaService } from './auditoria.service';

/** Auditoría del panel: registra automáticamente cada cambio con un interceptor global. */
@Module({
  controllers: [AuditoriaAdminController],
  providers: [
    AuditoriaService,
    AuditoriaRepository,
    { provide: APP_INTERCEPTOR, useClass: AuditoriaInterceptor },
  ],
})
export class AuditoriaModule {}
