import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import { AMayusculas, RecortarTexto } from '../../comun/transformadores';

/** Datos de una variante (por ejemplo, un color) con su precio y stock. */
export class CrearVarianteDto {
  // Código interno único: se guarda en mayúsculas ("mate-negro" → "MATE-NEGRO")
  @AMayusculas()
  @IsString({ message: 'El SKU debe ser un texto.' })
  @Matches(/^[A-Z0-9-]{2,60}$/, {
    message: 'El SKU solo admite letras, números y guiones (de 2 a 60 caracteres).',
  })
  sku!: string;

  @RecortarTexto()
  @IsString({ message: 'El nombre de la variante debe ser un texto.' })
  @Length(1, 80, { message: 'El nombre de la variante debe tener entre 1 y 80 caracteres.' })
  nombre!: string;

  // Color para mostrar en el sitio, en formato #RRGGBB
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe tener el formato #RRGGBB.' })
  colorHex?: string | null;

  @IsInt({ message: 'El precio debe ser un número entero de pesos.' })
  @Min(1, { message: 'El precio debe ser mayor a 0.' })
  @Max(100_000_000, { message: 'El precio es demasiado alto.' })
  precio!: number;

  // Opcional: si se manda null, se quita la oferta
  @IsOptional()
  @IsInt({ message: 'El precio de oferta debe ser un número entero de pesos.' })
  @Min(1, { message: 'El precio de oferta debe ser mayor a 0.' })
  precioOferta?: number | null;

  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  @Max(1_000_000, { message: 'El stock es demasiado alto.' })
  stock!: number;

  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero.' })
  @Min(0, { message: 'El orden no puede ser negativo.' })
  @Max(1000, { message: 'El orden no puede ser mayor a 1000.' })
  orden?: number;
}
