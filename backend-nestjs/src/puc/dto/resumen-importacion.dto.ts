// backend-nestjs/src/puc/dto/resultado-importacion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResumenImportacionDto {
  @ApiProperty({
    description: 'Total de filas procesadas',
    example: 500
  })
  total_procesadas: number;

  @ApiProperty({
    description: 'Número de cuentas insertadas',
    example: 450
  })
  insertadas: number;

  @ApiProperty({
    description: 'Número de cuentas actualizadas',
    example: 30
  })
  actualizadas: number;

  @ApiProperty({
    description: 'Número de errores encontrados',
    example: 5
  })
  errores: number;

  @ApiProperty({
    description: 'Número de filas omitidas',
    example: 15
  })
  omitidas: number;

  @ApiPropertyOptional({
    description: 'Tiempo de procesamiento en milisegundos',
    example: 2500
  })
  tiempo_procesamiento?: number;
}

export class ErrorImportacionDto {
  @ApiProperty({
    description: 'Número de fila donde ocurrió el error',
    example: 15
  })
  fila: number;

  @ApiProperty({
    description: 'Descripción del error',
    example: 'Error al insertar cuenta 110501: código duplicado'
  })
  error: string;
}

export class ResultadoImportacionDto {
  @ApiProperty({
    description: 'Indica si la importación fue exitosa',
    example: true
  })
  exito: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Importación completada exitosamente'
  })
  mensaje: string;

  @ApiProperty({
    description: 'Resumen estadístico de la importación',
    type: ResumenImportacionDto
  })
  resumen: ResumenImportacionDto;

  @ApiProperty({
    description: 'Lista de errores encontrados durante la importación',
    type: [ErrorImportacionDto]
  })
  errores: ErrorImportacionDto[];

  @ApiProperty({
    description: 'Lista de advertencias generadas',
    type: [String],
    example: ['Cuenta 1105 ya existía y fue omitida']
  })
  advertencias: string[];

  @ApiPropertyOptional({
    description: 'Nombre del archivo procesado',
    example: 'puc_import_2024.xlsx'
  })
  archivo_procesado?: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora del procesamiento',
    example: '2024-01-15T10:30:00.000Z'
  })
  fecha_procesamiento?: Date;
}