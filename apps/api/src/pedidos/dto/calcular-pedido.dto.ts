import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/** Un renglón del pedido: qué variante y cuántas unidades. */
export class ItemPedidoDto {
  @IsUUID('all', { message: 'varianteId debe ser un identificador válido.' })
  varianteId!: string;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad debe ser al menos 1.' })
  @Max(100_000, { message: 'La cantidad es demasiado alta.' })
  cantidad!: number;
}

/** El pedido que arma el cliente en el sitio. */
export class CalcularPedidoDto {
  @IsArray({ message: 'items debe ser una lista.' })
  @ArrayMinSize(1, { message: 'El pedido debe tener al menos un producto.' })
  @ArrayMaxSize(100, { message: 'El pedido no puede tener más de 100 renglones.' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items!: ItemPedidoDto[];
}
