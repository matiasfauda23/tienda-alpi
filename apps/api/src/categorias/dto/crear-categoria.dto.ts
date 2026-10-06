import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

/** Datos que se aceptan para crear una categoría. */
export class CrearCategoriaDto {
  // Quita espacios al principio y al final antes de validar
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El nombre debe ser un texto.' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres.' })
  nombre!: string;

  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero.' })
  @Min(0, { message: 'El orden no puede ser negativo.' })
  @Max(1000, { message: 'El orden no puede ser mayor a 1000.' })
  orden?: number;

  @IsOptional()
  @IsBoolean({ message: 'El campo activa debe ser true o false.' })
  activa?: boolean;
}
