import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { EscalaDto } from './escala.dto';

/** La lista completa de escalas que quedará guardada. */
export class ReemplazarEscalasDto {
  @IsArray({ message: 'escalas debe ser una lista.' })
  @ArrayMinSize(1, { message: 'Debe haber al menos una escala.' })
  @ArrayMaxSize(10, { message: 'No puede haber más de 10 escalas.' })
  @ValidateNested({ each: true })
  @Type(() => EscalaDto)
  escalas!: EscalaDto[];
}
