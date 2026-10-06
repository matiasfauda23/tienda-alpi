import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsString, Length, ValidateNested } from 'class-validator';
import { RecortarTexto } from '../../comun/transformadores';

/** Una pregunta frecuente con su respuesta. */
export class PreguntaFrecuenteDto {
  @RecortarTexto()
  @IsString({ message: 'La pregunta debe ser un texto.' })
  @Length(5, 200, { message: 'La pregunta debe tener entre 5 y 200 caracteres.' })
  pregunta!: string;

  @RecortarTexto()
  @IsString({ message: 'La respuesta debe ser un texto.' })
  @Length(1, 2000, { message: 'La respuesta debe tener entre 1 y 2000 caracteres.' })
  respuesta!: string;
}

/** La lista completa de preguntas frecuentes, en el orden en que se muestran. */
export class FaqDto {
  @IsArray({ message: 'preguntas debe ser una lista.' })
  @ArrayMaxSize(50, { message: 'No puede haber más de 50 preguntas.' })
  @ValidateNested({ each: true })
  @Type(() => PreguntaFrecuenteDto)
  preguntas!: PreguntaFrecuenteDto[];
}
