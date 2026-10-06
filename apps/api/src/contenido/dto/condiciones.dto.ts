import { IsString, MaxLength } from 'class-validator';

/** Condiciones de venta en Markdown (títulos con #, listas con -, negritas con **). */
export class CondicionesDto {
  @IsString({ message: 'El texto debe ser un texto.' })
  @MaxLength(10_000, { message: 'Las condiciones no pueden superar los 10.000 caracteres.' })
  texto!: string;
}
