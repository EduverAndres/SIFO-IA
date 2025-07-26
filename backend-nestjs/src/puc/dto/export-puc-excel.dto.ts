import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ExportPucExcelDto {
  @ApiProperty({ 
    description: 'Incluir columnas de saldos actuales',
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluir_saldos?: boolean = true;

  @ApiProperty({ 
    description: 'Incluir columnas de movimientos contables',
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluir_movimientos?: boolean = true;

  @ApiProperty({ 
    description: 'Incluir columnas de información fiscal',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluir_fiscal?: boolean = false;

  @ApiProperty({ 
    description: 'Filtrar por estado de cuenta',
    enum: ['ACTIVA', 'INACTIVA'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVA', 'INACTIVA'])
  filtro_estado?: string;

  @ApiProperty({ 
    description: 'Filtrar por tipo de cuenta',
    enum: ['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'AUXILIAR'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'AUXILIAR'])
  filtro_tipo?: string;

  @ApiProperty({ 
    description: 'Filtrar por clase (1-9)',
    required: false
  })
  @IsOptional()
  @IsString()
  filtro_clase?: string;

  @ApiProperty({ 
    description: 'Exportar solo cuentas con movimientos',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  solo_movimientos?: boolean = false;

  @ApiProperty({ 
    description: 'Incluir cuentas inactivas en la exportación',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluir_inactivas?: boolean = false;

  // 🆕 NUEVA PROPIEDAD AGREGADA
  @ApiProperty({ 
    description: 'Incluir hoja de resumen con estadísticas',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluir_resumen?: boolean = false;
}