import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ErrorDeValidacionDePrecios } from '@tienda-alpi/precios';
import type { Response } from 'express';

/** Convierte los errores de validación del paquete de precios en respuestas 400 con su mensaje. */
@Catch(ErrorDeValidacionDePrecios)
export class ErrorDePreciosFilter implements ExceptionFilter {
  /** Arma la respuesta HTTP con el mismo formato que usan los errores de Nest. */
  catch(error: ErrorDeValidacionDePrecios, host: ArgumentsHost): void {
    const respuesta = host.switchToHttp().getResponse<Response>();

    respuesta.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: error.message,
    });
  }
}
