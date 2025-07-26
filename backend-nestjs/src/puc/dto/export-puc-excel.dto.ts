// backend-nestjs/src/puc/dto/export-puc-excel.dto.ts
import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportPucExcelDto {
  @ApiPropertyOptional({
    description: 'Incluir saldos en la exportación',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_saldos?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir movimientos en la exportación',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_movimientos?: boolean = true;

  @ApiPropertyOptional({
    description: 'Filtro por estado de las cuentas',
    enum: ['ACTIVA', 'INACTIVA', 'TODAS'],
    default: 'ACTIVA'
  })
  @IsOptional()
  @IsEnum(['ACTIVA', 'INACTIVA', 'TODAS'])
  filtro_estado?: string = 'ACTIVA';

  @ApiPropertyOptional({
    description: 'Filtro por tipo de cuenta',
    type: String
  })
  @IsOptional()
  @IsString()
  filtro_tipo?: string;

  @ApiPropertyOptional({
    description: 'Incluir información fiscal',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  incluir_fiscal?: boolean = true;
}