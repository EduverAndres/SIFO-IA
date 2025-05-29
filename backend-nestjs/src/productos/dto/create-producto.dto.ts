

// backend-nestjs/src/productos/dto/create-producto.dto.ts
import { IsString, IsOptional, IsInt, Min, Length, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El stock actual debe ser un número entero' })
  @Min(0, { message: 'El stock actual no puede ser negativo' })
  stock_actual?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El stock mínimo debe ser un número entero' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  stock_minimo?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El stock máximo debe ser un número entero' })
  @Min(1, { message: 'El stock máximo debe ser al menos 1' })
  stock_maximo?: number = 100;
}
