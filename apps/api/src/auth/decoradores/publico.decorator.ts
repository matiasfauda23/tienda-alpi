import { SetMetadata } from '@nestjs/common';

/** Clave con la que se marca un endpoint como público. */
export const CLAVE_PUBLICO = 'esPublico';

/** Marca un controlador o un endpoint como público: no requiere iniciar sesión. */
export const Publico = () => SetMetadata(CLAVE_PUBLICO, true);
