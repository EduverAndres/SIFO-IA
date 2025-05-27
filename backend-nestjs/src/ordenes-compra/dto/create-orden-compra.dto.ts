import {
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetalleOrdenDto } from './create-detalle-orden.dto';

export class CreateOrdenCompraDto {
  @IsInt()
  @IsPositive()
  id_proveedor: number;

  @IsDateString()
  fecha_entrega: Date; // Usaremos DateString para la entrada del cliente

  @IsOptional()
  @IsString()
  archivo_adjunto_url?: string; // Ahora esperamos la URL del archivo, no el base64

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleOrdenDto)
  detalles: CreateDetalleOrdenDto[];
}