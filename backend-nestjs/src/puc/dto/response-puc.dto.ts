 // backend-nestjs/src/puc/dto/response-puc.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NaturalezaCuentaEnum, TipoCuentaEnum, EstadoCuentaEnum } from '../entities/cuenta-puc.entity';

export class ResponsePucDto {
  @ApiProperty({
    description: 'ID único de la cuenta',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Código completo de la cuenta PUC',
    example: '110501'
  })
  codigo_completo: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la cuenta',
    example: 'Caja principal'
  })
  nombre: string;

  @ApiProperty({
    description: 'Naturaleza de la cuenta (DEBITO o CREDITO)',
    enum: NaturalezaCuentaEnum,
    example: NaturalezaCuentaEnum.DEBITO
  })
  naturaleza: NaturalezaCuentaEnum;

  @ApiProperty({
    description: 'Tipo de cuenta según su nivel jerárquico',
    enum: TipoCuentaEnum,
    example: TipoCuentaEnum.DETALLE
  })
  tipo_cuenta: TipoCuentaEnum;

  @ApiProperty({
    description: 'Estado actual de la cuenta',
    enum: EstadoCuentaEnum,
    example: EstadoCuentaEnum.ACTIVA
  })
  estado: EstadoCuentaEnum;

  @ApiProperty({
    description: 'Nivel jerárquico de la cuenta (1-5)',
    example: 4
  })
  nivel: number;

  @ApiProperty({
    description: 'Indica si la cuenta acepta movimientos contables',
    example: true
  })
  acepta_movimientos: boolean;

  @ApiPropertyOptional({
    description: 'Código de la cuenta padre en la jerarquía',
    example: '1105'
  })
  codigo_padre?: string;

  @ApiProperty({
    description: 'Saldo inicial de la cuenta',
    example: 1500000.00
  })
  saldo_inicial: number;

  @ApiProperty({
    description: 'Saldo final de la cuenta',
    example: 1750000.00
  })
  saldo_final: number;

  @ApiPropertyOptional({
    description: 'Código de clase (1 dígito)',
    example: '1'
  })
  codigo_clase?: string;

  @ApiPropertyOptional({
    description: 'Código de grupo (2 dígitos)',
    example: '11'
  })
  codigo_grupo?: string;

  @ApiPropertyOptional({
    description: 'Código de cuenta (4 dígitos)',
    example: '1105'
  })
  codigo_cuenta?: string;

  @ApiPropertyOptional({
    description: 'Código de subcuenta (6 dígitos)',
    example: '110501'
  })
  codigo_subcuenta?: string;

  @ApiPropertyOptional({
    description: 'Código de detalle (8+ dígitos)',
    example: '11050101'
  })
  codigo_detalle?: string;

  @ApiProperty({
    description: 'Indica si el registro está activo',
    example: true
  })
  activo: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00.000Z'
  })
  fecha_creacion: Date;

  @ApiPropertyOptional({
    description: 'Fecha de última modificación',
    example: '2024-01-20T15:45:00.000Z'
  })
  fecha_modificacion?: Date;

  // Campos adicionales opcionales para información fiscal
  @ApiPropertyOptional({
    description: 'Total de movimientos débito',
    example: 2500000.00
  })
  movimientos_debito?: number;

  @ApiPropertyOptional({
    description: 'Total de movimientos crédito',
    example: 2250000.00
  })
  movimientos_credito?: number;

  @ApiPropertyOptional({
    description: 'Centro de costos asociado',
    example: 'CC001'
  })
  centro_costos?: string;

  @ApiPropertyOptional({
    description: 'Aplica para formulario 350',
    example: false
  })
  aplica_f350?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para formulario 300',
    example: false
  })
  aplica_f300?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para información exógena',
    example: false
  })
  aplica_exogena?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para ICA',
    example: false
  })
  aplica_ica?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica para DR110',
    example: false
  })
  aplica_dr110?: boolean;
}