import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Parámetros de paginación que llegan por la URL: ?pagina=2&porPagina=20 */
export class PaginacionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pagina debe ser un número entero.' })
  @Min(1, { message: 'pagina debe ser 1 o mayor.' })
  @Max(10_000, { message: 'pagina es demasiado alta.' })
  pagina: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'porPagina debe ser un número entero.' })
  @Min(1, { message: 'porPagina debe ser 1 o mayor.' })
  @Max(100, { message: 'porPagina no puede ser mayor a 100.' })
  porPagina: number = 20;
}
