// backend-nestjs/src/puc/dto/create-cuenta-puc.dto.ts
import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NaturalezaCuentaEnum, TipoCuentaEnum, EstadoCuentaEnum } from '../entities/cuenta-puc.entity';

export class CreateCuentaPucDto {
  @ApiProperty({
    description: 'Código completo de la cuenta PUC',
    example: '110501'
  })
  @IsString()
  codigo_completo: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la cuenta',
    example: 'Caja principal'
  })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Naturaleza de la cuenta',
    enum: NaturalezaCuentaEnum
  })
  @IsOptional()
  @IsEnum(NaturalezaCuentaEnum)
  naturaleza?: NaturalezaCuentaEnum;

  @ApiPropertyOptional({
    description: 'Tipo de cuenta',
    enum: TipoCuentaEnum
  })
  @IsOptional()
  @IsEnum(TipoCuentaEnum)
  tipo_cuenta?: TipoCuentaEnum;

  @ApiPropertyOptional({
    description: 'Estado de la cuenta',
    enum: EstadoCuentaEnum,
    default: EstadoCuentaEnum.ACTIVA
  })
  @IsOptional()
  @IsEnum(EstadoCuentaEnum)
  estado?: EstadoCuentaEnum;

  @ApiPropertyOptional({
    description: 'Código de la cuenta padre',
    example: '1105'
  })
  @IsOptional()
  @IsString()
  codigo_padre?: string;

  @ApiPropertyOptional({
    description: 'Indica si acepta movimientos',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  acepta_movimientos?: boolean;

  @ApiPropertyOptional({
    description: 'Saldo inicial',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  saldo_inicial?: number;

  @ApiPropertyOptional({
    description: 'Saldo final',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  saldo_final?: number;
}