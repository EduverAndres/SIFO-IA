// backend-nestjs/src/puc/dto/resultado-validacion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorValidacionDto {
  @ApiProperty({
    description: 'Número de fila donde ocurrió el error',
    example: 5
  })
  fila: number;

  @ApiProperty({
    description: 'Descripción del error encontrado',
    example: 'Código duplicado: 1105'
  })
  error: string;
}

export class EstadisticasValidacionDto {
  @ApiProperty({
    description: 'Cantidad de cuentas por nivel jerárquico',
    example: { "1": 5, "2": 15, "3": 45, "4": 120, "5": 350 }
  })
  cuentas_por_nivel: Record<string, number>;

  @ApiProperty({
    description: 'Cantidad de cuentas por clase',
    example: { "1": 150, "2": 80, "3": 45, "4": 200, "5": 25 }
  })
  cuentas_por_clase: Record<string, number>;

  @ApiProperty({
    description: 'Número de códigos duplicados encontrados',
    example: 3
  })
  duplicados_encontrados: number;

  @ApiProperty({
    description: 'Número de cuentas sin padre válido',
    example: 2
  })
  cuentas_sin_padre: number;
}

export class ResultadoValidacionDto {
  @ApiProperty({
    description: 'Indica si el archivo es válido para importación',
    example: true
  })
  es_valido: boolean;

  @ApiProperty({
    description: 'Número total de filas procesadas',
    example: 500
  })
  total_filas: number;

  @ApiProperty({
    description: 'Número de filas válidas',
    example: 485
  })
  filas_validas: number;

  @ApiProperty({
    description: 'Lista de errores encontrados durante la validación',
    type: [ErrorValidacionDto]
  })
  errores: ErrorValidacionDto[];

  @ApiProperty({
    description: 'Lista de advertencias encontradas',
    type: [String],
    example: ['Fila 10: Saldo negativo detectado', 'Fila 25: Nombre muy largo']
  })
  advertencias: string[];

  @ApiProperty({
    description: 'Estadísticas detalladas de la validación',
    type: EstadisticasValidacionDto
  })
  estadisticas: EstadisticasValidacionDto;
}