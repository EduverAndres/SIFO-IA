// backend-nestjs/src/puc/dto/importar-puc.dto.ts
import { IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCuentaPucDto } from './create-cuenta-puc.dto';

export class ImportarPucDto {
  @ApiProperty({
    description: 'Lista de cuentas a importar',
    type: [CreateCuentaPucDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCuentaPucDto)
  cuentas: CreateCuentaPucDto[];

  @ApiPropertyOptional({
    description: 'Sobrescribir cuentas existentes si hay conflictos',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  sobrescribir_existentes?: boolean = false;

  @ApiPropertyOptional({
    description: 'Validar jerarquía antes de importar',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  validar_jerarquia?: boolean = true;

  @ApiPropertyOptional({
    description: 'Importar PUC estándar colombiano',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  importar_estandar?: boolean = false;
}