import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { RecortarTexto } from '../../comun/transformadores';
import { CrearVarianteDto } from './crear-variante.dto';

/** Datos para crear un producto junto con sus variantes. */
export class CrearProductoDto {
  @RecortarTexto()
  @IsString({ message: 'El nombre debe ser un texto.' })
  @Length(2, 120, { message: 'El nombre debe tener entre 2 y 120 caracteres.' })
  nombre!: string;

  @IsOptional()
  @RecortarTexto()
  @IsString({ message: 'La descripción debe ser un texto.' })
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres.' })
  descripcion?: string;

  @IsUUID('all', { message: 'categoriaId debe ser un identificador válido.' })
  categoriaId!: string;

  @IsOptional()
  @IsBoolean({ message: 'destacado debe ser true o false.' })
  destacado?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'nuevo debe ser true o false.' })
  nuevo?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'activo debe ser true o false.' })
  activo?: boolean;

  // Lista de variantes: cada elemento se valida con las reglas de CrearVarianteDto
  @IsArray({ message: 'variantes debe ser una lista.' })
  @ArrayMinSize(1, { message: 'El producto debe tener al menos una variante.' })
  @ArrayMaxSize(50, { message: 'Un producto no puede tener más de 50 variantes.' })
  @ValidateNested({ each: true })
  @Type(() => CrearVarianteDto)
  variantes!: CrearVarianteDto[];
}
