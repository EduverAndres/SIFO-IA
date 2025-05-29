// backend-nestjs/src/ordenes-compra/dto/filtros-orden.dto.ts
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { EstadoOrden } from './update-estado-orden.dto';

export class FiltrosOrdenDto {
  @IsOptional()
  @IsEnum(EstadoOrden, {
    message: 'El estado debe ser uno de: Pendiente, Aprobada, Completada, Cancelada'
  })
  estado?: EstadoOrden;

  @IsOptional()
  @IsString({ message: 'El nombre del proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  fecha_desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  fecha_hasta?: string;
}