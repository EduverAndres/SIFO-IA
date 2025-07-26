// backend-nestjs/src/puc/dto/export-puc-excel.dto.ts
import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoCuentaEnum, TipoCuentaEnum } from '../entities/cuenta-puc.entity';

export class ExportPucExcelDto {
  @ApiPropertyOptional({
    description: 'Incluir información de saldos en la exportación',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_saldos?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir información de movimientos',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_movimientos?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir información fiscal',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_fiscal?: boolean = true;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de cuenta',
    enum: EstadoCuentaEnum,
    type: String
  })
  @IsOptional()
  @IsEnum(EstadoCuentaEnum)
  filtro_estado?: EstadoCuentaEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de cuenta',
    enum: TipoCuentaEnum,
    type: String
  })
  @IsOptional()
  @IsEnum(TipoCuentaEnum)
  filtro_tipo?: TipoCuentaEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por clase de cuenta (1-9)',
    type: String
  })
  @IsOptional()
  @IsString()
  filtro_clase?: string;

  @ApiPropertyOptional({
    description: 'Incluir solo cuentas que aceptan movimientos',
    default: false,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  solo_movimientos?: boolean = false;

  @ApiPropertyOptional({
    description: 'Incluir cuentas inactivas',
    default: false,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_inactivas?: boolean = false;

  @ApiPropertyOptional({
    description: 'Formato de archivo de salida',
    default: 'xlsx',
    enum: ['xlsx', 'csv'],
    type: String
  })
  @IsOptional()
  @IsString()
  formato?: 'xlsx' | 'csv' = 'xlsx';
}