// backend-nestjs/src/puc/dto/response-puc.dto.ts - ACTUALIZADO PARA NUEVO ESQUEMA
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

  @ApiPropertyOptional({
    description: 'Código de la cuenta padre en la jerarquía',
    example: '1105'
  })
  codigo_padre?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la cuenta',
    example: 'Caja principal - Efectivo disponible'
  })
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de cuenta según su nivel jerárquico',
    enum: TipoCuentaEnum,
    example: TipoCuentaEnum.DETALLE
  })
  tipo_cuenta: TipoCuentaEnum;

  @ApiProperty({
    description: 'Naturaleza de la cuenta (DEBITO o CREDITO)',
    enum: NaturalezaCuentaEnum,
    example: NaturalezaCuentaEnum.DEBITO
  })
  naturaleza: NaturalezaCuentaEnum;

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
    description: 'Tipo específico de cuenta (D=Detalle, G=Grupo)',
    example: 'D'
  })
  tipo_cta: string;

  @ApiProperty({
    description: 'Indica si la cuenta acepta movimientos contables',
    example: true
  })
  acepta_movimientos: boolean;

  @ApiProperty({
    description: 'Requiere información de tercero',
    example: false
  })
  requiere_tercero: boolean;

  @ApiProperty({
    description: 'Requiere centro de costo',
    example: false
  })
  requiere_centro_costo: boolean;

  @ApiProperty({
    description: 'Indica si el registro está activo',
    example: true
  })
  activo: boolean;

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

  @ApiProperty({
    description: 'Total de movimientos débito',
    example: 2500000.00
  })
  movimientos_debito: number;

  @ApiProperty({
    description: 'Total de movimientos crédito',
    example: 2250000.00
  })
  movimientos_credito: number;

  @ApiPropertyOptional({
    description: 'Centro de costos asociado',
    example: 'CC001'
  })
  centro_costos?: string;

  @ApiProperty({
    description: 'Aplica para DR110',
    example: false
  })
  aplica_dr110: boolean;

  @ApiProperty({
    description: 'Aplica para formulario F350',
    example: false
  })
  aplica_f350: boolean;

  @ApiProperty({
    description: 'Aplica para formulario F300',
    example: false
  })
  aplica_f300: boolean;

  @ApiProperty({
    description: 'Aplica para información exógena',
    example: false
  })
  aplica_exogena: boolean;

  @ApiProperty({
    description: 'Aplica para ICA',
    example: false
  })
  aplica_ica: boolean;

  @ApiPropertyOptional({
    description: 'Conciliación fiscal',
    example: 'H2 (ESF - Patrimonio)'
  })
  conciliacion_fiscal?: string;

  @ApiPropertyOptional({
    description: 'Tipo orden de magnitud',
    example: 'OM001'
  })
  tipo_om?: string;

  @ApiPropertyOptional({
    description: 'Código AT',
    example: 'AT001'
  })
  codigo_at?: string;

  @ApiPropertyOptional({
    description: 'Código CT',
    example: 'CT001'
  })
  codigo_ct?: string;

  @ApiPropertyOptional({
    description: 'Código CC',
    example: 'CC001'
  })
  codigo_cc?: string;

  @ApiPropertyOptional({
    description: 'Código TI',
    example: 'TI001'
  })
  codigo_ti?: string;

  @ApiProperty({
    description: 'Es cuenta NIIF',
    example: false
  })
  es_cuenta_niif: boolean;

  @ApiPropertyOptional({
    description: 'Código NIIF equivalente',
    example: 'NIIF001'
  })
  codigo_niif?: string;

  @ApiPropertyOptional({
    description: 'Dinámica contable de la cuenta',
    example: 'Se debita cuando ingresa efectivo, se acredita cuando sale efectivo'
  })
  dinamica?: string;

  @ApiPropertyOptional({
    description: 'ID de movimiento',
    example: 'MOV001'
  })
  id_movimiento?: string;

  @ApiPropertyOptional({
    description: 'Usuario que creó el registro',
    example: 'admin@empresa.com'
  })
  usuario_creacion?: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00.000Z'
  })
  fecha_creacion: Date;

  @ApiPropertyOptional({
    description: 'Usuario que modificó el registro',
    example: 'contador@empresa.com'
  })
  usuario_modificacion?: string;

  @ApiProperty({
    description: 'Fecha de última modificación',
    example: '2024-01-20T15:45:00.000Z'
  })
  fecha_modificacion: Date;

  @ApiPropertyOptional({
    description: 'Número de fila del Excel de origen',
    example: 10
  })
  fila_excel?: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Cuenta creada para manejo de efectivo'
  })
  observaciones?: string;
}