// backend-nestjs/src/ordenes-compra/dto/update-estado-orden.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum EstadoOrden {
  PENDIENTE = 'Pendiente',
  APROBADA = 'Aprobada',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada'
}

export class UpdateEstadoOrdenDto {
  @IsEnum(EstadoOrden, {
    message: 'El estado debe ser uno de: Pendiente, Aprobada, Completada, Cancelada'
  })
  estado: EstadoOrden;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Las observaciones no pueden exceder 500 caracteres'
  })
  observaciones?: string;
}

// Exportar también el enum para uso en otros archivos
export { EstadoOrden as EstadoOrdenEnum };