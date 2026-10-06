import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RecortarTexto } from '../../comun/transformadores';
import { ORDENES_CATALOGO } from '../producto.tipos';
import type { OrdenCatalogo } from '../producto.tipos';

/** Filtros del catálogo público que llegan por la URL. */
export class ListarProductosQueryDto {
  // "?categoria=mates,termos" se convierte en ['mates', 'termos']
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.split(',').map((slug) => slug.trim()).filter(Boolean)
      : value,
  )
  @IsArray({ message: 'categoria debe ser una lista de slugs separados por coma.' })
  @ArrayMaxSize(10, { message: 'Se pueden filtrar hasta 10 categorías a la vez.' })
  @IsString({ each: true, message: 'Cada categoría debe ser un texto.' })
  categoria?: string[];

  @IsOptional()
  @RecortarTexto()
  @IsString({ message: 'buscar debe ser un texto.' })
  @MaxLength(80, { message: 'La búsqueda no puede superar los 80 caracteres.' })
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'precioMin debe ser un número entero.' })
  @Min(0, { message: 'precioMin no puede ser negativo.' })
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'precioMax debe ser un número entero.' })
  @Min(0, { message: 'precioMax no puede ser negativo.' })
  precioMax?: number;

  @IsOptional()
  @IsIn(ORDENES_CATALOGO, { message: `orden debe ser uno de: ${ORDENES_CATALOGO.join(', ')}.` })
  orden: OrdenCatalogo = 'recientes';

  // "?destacados=true" se convierte en el booleano true
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean({ message: 'destacados debe ser true o false.' })
  destacados?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pagina debe ser un número entero.' })
  @Min(1, { message: 'pagina debe ser 1 o mayor.' })
  @Max(1000, { message: 'pagina es demasiado alta.' })
  pagina: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'porPagina debe ser un número entero.' })
  @Min(1, { message: 'porPagina debe ser 1 o mayor.' })
  @Max(48, { message: 'porPagina no puede ser mayor a 48.' })
  porPagina: number = 12;
}
