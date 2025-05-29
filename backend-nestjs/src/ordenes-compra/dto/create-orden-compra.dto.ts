// backend-nestjs/src/ordenes-compra/dto/create-orden-compra.dto.ts
import {
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsPositive,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetalleOrdenDto } from './create-detalle-orden.dto';

export class CreateOrdenCompraDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID del proveedor debe ser un número entero' })
  @IsPositive({ message: 'El ID del proveedor debe ser positivo' })
  id_proveedor: number;

  @IsDateString({}, { message: 'La fecha de entrega debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de entrega es obligatoria' })
  fecha_entrega: string;

  @IsOptional()
  @IsString({ message: 'La URL del archivo debe ser una cadena de texto' })
  archivo_adjunto_url?: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;

  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un detalle' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleOrdenDto)
  detalles: CreateDetalleOrdenDto[];
}