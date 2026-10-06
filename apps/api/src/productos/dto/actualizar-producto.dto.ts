import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CrearProductoDto } from './crear-producto.dto';

/** Datos para modificar un producto: todo opcional y sin variantes (esas tienen sus propios endpoints). */
export class ActualizarProductoDto extends PartialType(
  OmitType(CrearProductoDto, ['variantes'] as const),
) {}
