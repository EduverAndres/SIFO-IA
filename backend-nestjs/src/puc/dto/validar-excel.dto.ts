// backend-nestjs/src/puc/dto/validar-excel.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ValidarExcelDto {
  @ApiPropertyOptional({
    description: 'Nombre de la hoja de Excel a validar',
    default: 'PUC',
    type: String
  })
  @IsOptional()
  @IsString()
  hoja?: string = 'PUC';

  @ApiPropertyOptional({
    description: 'Fila donde inician los datos (después de headers)',
    default: 3,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  fila_inicio?: number = 3;

  @ApiPropertyOptional({
    description: 'Validar estructura jerárquica',
    default: true,
    type: Boolean
  })
  @IsOptional()
  validar_jerarquia?: boolean = true;
}