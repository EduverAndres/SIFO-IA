// backend-nestjs/src/puc/dto/response-puc.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuentaPuc } from '../entities/cuenta-puc.entity';

export class ResponsePucDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Cuenta creada exitosamente'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Datos de respuesta (cuenta o lista de cuentas)'
  })
  data?: CuentaPuc | CuentaPuc[];

  @ApiPropertyOptional({
    description: 'Total de registros encontrados',
    example: 25
  })
  total?: number;

  @ApiPropertyOptional({
    description: 'Página actual',
    example: 1
  })
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 50
  })
  limite?: number;

  @ApiPropertyOptional({
    description: 'Lista de errores si los hay',
    type: [String]
  })
  errores?: string[];
}

export class EstadisticasPucDto {
  @ApiProperty({
    description: 'Total de cuentas en el sistema',
    example: 125
  })
  total_cuentas: number;

  @ApiProperty({
    description: 'Número de cuentas activas',
    example: 120
  })
  cuentas_activas: number;

  @ApiProperty({
    description: 'Número de cuentas inactivas',
    example: 5
  })
  cuentas_inactivas: number;

  @ApiProperty({
    description: 'Distribución por tipo de cuenta',
    example: {
      CLASE: 6,
      GRUPO: 15,
      CUENTA: 25,
      SUBCUENTA: 45,
      AUXILIAR: 34
    }
  })
  por_tipo: Record<string, number>;

  @ApiProperty({
    description: 'Distribución por naturaleza',
    example: {
      DEBITO: 75,
      CREDITO: 50
    }
  })
  por_naturaleza: Record<string, number>;

  @ApiProperty({
    description: 'Distribución por clase contable',
    example: {
      '1': { nombre: 'ACTIVOS', cantidad: 45 },
      '2': { nombre: 'PASIVOS', cantidad: 25 }
    }
  })
  por_clase: Record<string, {
    nombre: string;
    cantidad: number;
  }>;
}

