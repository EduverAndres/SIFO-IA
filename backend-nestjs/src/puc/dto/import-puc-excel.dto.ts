// backend-nestjs/src/puc/dto/import-puc-excel.dto.ts
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImportPucExcelDto {
  @ApiPropertyOptional({
    description: 'Sobreescribir cuentas existentes',
    default: false,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  sobreescribir?: boolean = false;

  @ApiPropertyOptional({
    description: 'Validar estructura jerárquica',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  validar_jerarquia?: boolean = true;

  @ApiPropertyOptional({
    description: 'Importar saldos desde el Excel',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  importar_saldos?: boolean = true;

  @ApiPropertyOptional({
    description: 'Nombre de la hoja de Excel a procesar',
    default: 'PUC',
    type: String
  })
  @IsOptional()
  @IsString()
  hoja?: string = 'PUC';

  @ApiPropertyOptional({
    description: 'Importar información fiscal (F350, F300, etc.)',
    default: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  importar_fiscal?: boolean = true;

  @ApiPropertyOptional({
    description: 'Fila donde inician los datos (después de headers)',
    default: 2,
    type: Number
  })
  @IsOptional()
  fila_inicio?: number = 2;
}



