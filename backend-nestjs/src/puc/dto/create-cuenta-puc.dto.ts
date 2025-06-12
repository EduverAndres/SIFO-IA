import { IsString, IsOptional, IsBoolean, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCuentaPucDto {
  @ApiProperty({ description: 'Código único de la cuenta', example: '1105' })
  @IsString()
  @Length(1, 20)
  @Matches(/^\d+$/, { message: 'El código debe contener solo números' })
  codigo: string;

  @ApiProperty({ description: 'Nombre de la cuenta', example: 'CAJA' })
  @IsString()
  @Length(1, 255)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción de la cuenta' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Código de la cuenta padre' })
  @IsOptional()
  @IsString()
  codigo_padre?: string;

  @ApiPropertyOptional({ description: 'Permite movimientos contables' })
  @IsOptional()
  @IsBoolean()
  permite_movimiento?: boolean;

  @ApiPropertyOptional({ description: 'Requiere tercero' })
  @IsOptional()
  @IsBoolean()
  requiere_tercero?: boolean;

  @ApiPropertyOptional({ description: 'Requiere centro de costo' })
  @IsOptional()
  @IsBoolean()
  requiere_centro_costo?: boolean;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}