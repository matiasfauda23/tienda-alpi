import { PartialType } from '@nestjs/mapped-types';
import { CrearVarianteDto } from './crear-variante.dto';

/** Datos para modificar una variante: las mismas reglas que al crear, todos opcionales. */
export class ActualizarVarianteDto extends PartialType(CrearVarianteDto) {}
