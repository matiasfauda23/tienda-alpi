import { IsBoolean, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { RecortarTexto } from '../../comun/transformadores';

/** Banner principal del inicio. */
export class BannerDto {
  @IsBoolean({ message: 'visible debe ser true o false.' })
  visible!: boolean;

  @RecortarTexto()
  @IsString({ message: 'El título debe ser un texto.' })
  @Length(1, 80, { message: 'El título debe tener entre 1 y 80 caracteres.' })
  titulo!: string;

  @IsOptional()
  @RecortarTexto()
  @IsString({ message: 'El subtítulo debe ser un texto.' })
  @MaxLength(160, { message: 'El subtítulo no puede superar los 160 caracteres.' })
  subtitulo?: string;
}
