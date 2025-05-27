import { IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetalleOrdenDto {
  @IsInt()
  @IsPositive()
  id_producto: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0.01)
  precio_unitario: number;
}