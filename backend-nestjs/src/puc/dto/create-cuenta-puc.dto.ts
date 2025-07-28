// backend-nestjs/src/puc/dto/create-cuenta-puc.dto.ts - ACTUALIZADO PARA NUEVO ESQUEMA
import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsNotEmpty, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NaturalezaCuentaEnum, TipoCuentaEnum, EstadoCuentaEnum } from '../entities/cuenta-puc.entity';
import { Type, Transform } from 'class-transformer';

export class CreateCuentaPucDto {
  @ApiProperty({
    description: 'Código completo de la cuenta PUC',
    example: '110501',
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty()
  codigo_completo: string;

  @ApiProperty({
    description: 'Descripción de la cuenta',
    example: 'Caja principal - Efectivo disponible'
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Código de clase (1 dígito)',
    example: '1',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_clase?: string;

  @ApiPropertyOptional({
    description: 'Código de grupo (2 dígitos)',
    example: '11',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_grupo?: string;

  @ApiPropertyOptional({
    description: 'Código de cuenta (4 dígitos)',
    example: '1105',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_cuenta?: string;

  @ApiPropertyOptional({
    description: 'Código de subcuenta (6 dígitos)',
    example: '110501',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_subcuenta?: string;

  @ApiPropertyOptional({
    description: 'Código de detalle (8+ dígitos)',
    example: '11050101',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_detalle?: string;

  @ApiPropertyOptional({
    description: 'Código de la cuenta padre',
    example: '1105',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  codigo_padre?: string;

  @ApiPropertyOptional({
    description: 'Tipo de cuenta según jerarquía',
    enum: TipoCuentaEnum,
    default: TipoCuentaEnum.DETALLE
  })
  @IsOptional()
  @IsEnum(TipoCuentaEnum)
  tipo_cuenta?: TipoCuentaEnum;

  @ApiPropertyOptional({
    description: 'Naturaleza de la cuenta',
    enum: NaturalezaCuentaEnum,
    default: NaturalezaCuentaEnum.DEBITO
  })
  @IsOptional()
  @IsEnum(NaturalezaCuentaEnum)
  naturaleza?: NaturalezaCuentaEnum;

  @ApiPropertyOptional({
    description: 'Estado de la cuenta',
    enum: EstadoCuentaEnum,
    default: EstadoCuentaEnum.ACTIVA
  })
  @IsOptional()
  @IsEnum(EstadoCuentaEnum)
  estado?: EstadoCuentaEnum;

  @ApiPropertyOptional({
    description: 'Nivel jerárquico (1-5)',
    example: 4,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nivel?: number;

  @ApiPropertyOptional({
    description: 'Tipo de cuenta (D=Detalle, G=Grupo)',
    example: 'D',
    default: 'D'
  })
  @IsOptional()
  @IsString()
  tipo_cta?: string;

  @ApiPropertyOptional({
    description: 'Indica si acepta movimientos',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  acepta_movimientos?: boolean;

  @ApiPropertyOptional({
    description: 'Requiere información de tercero',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  requiere_tercero?: boolean;

  @ApiPropertyOptional({
    description: 'Requiere centro de costo',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  requiere_centro_costo?: boolean;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Saldo inicial',
    example: 1500000.00,
    default: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value) || 0)
  saldo_inicial?: number;

  @ApiPropertyOptional({
    description: 'Saldo final',
    example: 1750000.00,
    default: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value) || 0)
  saldo_final?: number;

  @ApiPropertyOptional({
    description: 'Total movimientos débito',
    example: 2500000.00,
    default: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value) || 0)
  movimientos_debito?: number;

  @ApiPropertyOptional({
    description: 'Total movimientos crédito',
    example: 2250000.00,
    default: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value) || 0)
  movimientos_credito?: number;

  @ApiPropertyOptional({
    description: 'Centro de costos asociado',
    example: 'CC001',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  centro_costos?: string;

  @ApiPropertyOptional({
    description: 'Aplica para DR110',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  aplica_dr110?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para formulario F350',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  aplica_f350?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para formulario F300',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  aplica_f300?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para información exógena',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  aplica_exogena?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para ICA',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  aplica_ica?: boolean;

  @ApiPropertyOptional({
    description: 'Conciliación fiscal',
    example: 'H2 (ESF - Patrimonio)',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  conciliacion_fiscal?: string;

  @ApiPropertyOptional({
    description: 'Tipo orden de magnitud',
    example: 'OM001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  tipo_om?: string;

  @ApiPropertyOptional({
    description: 'Código AT',
    example: 'AT001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_at?: string;

  @ApiPropertyOptional({
    description: 'Código CT',
    example: 'CT001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_ct?: string;

  @ApiPropertyOptional({
    description: 'Código CC',
    example: 'CC001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_cc?: string;

  @ApiPropertyOptional({
    description: 'Código TI',
    example: 'TI001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  codigo_ti?: string;

  @ApiPropertyOptional({
    description: 'Es cuenta NIIF',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  es_cuenta_niif?: boolean;

  @ApiPropertyOptional({
    description: 'Código NIIF equivalente',
    example: 'NIIF001',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  codigo_niif?: string;

  @ApiPropertyOptional({
    description: 'Dinámica contable de la cuenta',
    example: 'Se debita cuando ingresa efectivo, se acredita cuando sale efectivo'
  })
  @IsOptional()
  @IsString()
  dinamica?: string;

  @ApiPropertyOptional({
    description: 'ID de movimiento',
    example: 'MOV001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  id_movimiento?: string;

  @ApiPropertyOptional({
    description: 'Usuario que crea el registro',
    example: 'admin@empresa.com',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  usuario_creacion?: string;

  @ApiPropertyOptional({
    description: 'Usuario que modifica el registro',
    example: 'contador@empresa.com',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  usuario_modificacion?: string;

  @ApiPropertyOptional({
    description: 'Número de fila del Excel de origen',
    example: 10
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fila_excel?: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Cuenta creada para manejo de efectivo en caja principal'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}