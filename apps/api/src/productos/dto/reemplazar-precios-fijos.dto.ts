import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsUUID, Max, Min, ValidateNested } from 'class-validator';

/** Precio fijo de una variante en una escala. */
export class PrecioFijoDto {
  @IsUUID('all', { message: 'escalaId debe ser un identificador válido.' })
  escalaId!: string;

  @IsInt({ message: 'El precio fijo debe ser un número entero de pesos.' })
  @Min(1, { message: 'El precio fijo debe ser mayor a 0.' })
  @Max(100_000_000, { message: 'El precio fijo es demasiado alto.' })
  precioUnitario!: number;
}

/** La lista completa de precios fijos de una variante. Una lista vacía los borra todos. */
export class ReemplazarPreciosFijosDto {
  @IsArray({ message: 'precios debe ser una lista.' })
  @ArrayMaxSize(10, { message: 'No puede haber más de 10 precios fijos.' })
  @ValidateNested({ each: true })
  @Type(() => PrecioFijoDto)
  precios!: PrecioFijoDto[];
}
