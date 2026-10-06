import { PartialType } from '@nestjs/mapped-types';
import { CrearCategoriaDto } from './crear-categoria.dto';

/** Datos para actualizar una categoría: las mismas reglas que al crear, pero todos opcionales. */
export class ActualizarCategoriaDto extends PartialType(CrearCategoriaDto) {}
