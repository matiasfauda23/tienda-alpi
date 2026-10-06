import { SetMetadata } from '@nestjs/common';

/** Clave con la que se marca un endpoint que el interceptor de auditoría debe ignorar. */
export const CLAVE_NO_AUDITAR = 'noAuditar';

/** El interceptor no registra este endpoint (porque no cambia nada, o porque registra a mano con más detalle). */
export const NoAuditar = () => SetMetadata(CLAVE_NO_AUDITAR, true);
