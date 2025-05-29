// backend-nestjs/src/ordenes-compra/dto/create-detalle-orden.dto.ts
import { IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetalleOrdenDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  id_producto: number;

  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0.01, { message: 'El precio unitario debe ser mayor a 0' })
  precio_unitario: number;
}