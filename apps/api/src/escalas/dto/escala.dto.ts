import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { RecortarTexto } from '../../comun/transformadores';

/** Una escala de la lista que manda el panel. Sin id = escala nueva; con id = escala existente a modificar. */
export class EscalaDto {
  @IsOptional()
  @IsUUID('all', { message: 'El id de la escala debe ser un identificador válido.' })
  id?: string;

  @RecortarTexto()
  @IsString({ message: 'El nombre de la escala debe ser un texto.' })
  @Length(2, 60, { message: 'El nombre de la escala debe tener entre 2 y 60 caracteres.' })
  nombre!: string;

  @IsInt({ message: 'La cantidad mínima debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima debe ser 1 o mayor.' })
  @Max(1_000_000, { message: 'La cantidad mínima es demasiado alta.' })
  cantidadMinima!: number;

  @IsInt({ message: 'El descuento debe ser un número entero.' })
  @Min(0, { message: 'El descuento no puede ser negativo.' })
  @Max(99, { message: 'El descuento no puede ser mayor a 99 %.' })
  porcentajeDescuento!: number;
}
