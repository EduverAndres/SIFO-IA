// backend-nestjs/src/puc/dto/arbol-puc.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NodoPucDto {
  @ApiProperty({ description: 'ID interno de la cuenta' })
  id: number;

  @ApiProperty({ description: 'Código único de la cuenta' })
  codigo: string;

  @ApiProperty({ description: 'Nombre de la cuenta' })
  nombre: string;

  @ApiProperty({ description: 'Tipo de cuenta' })
  tipo: string;

  @ApiProperty({ description: 'Naturaleza contable' })
  naturaleza: string;

  @ApiProperty({ description: 'Estado de la cuenta' })
  estado: string;

  @ApiProperty({ description: 'Nivel jerárquico' })
  nivel: number;

  @ApiProperty({ description: 'Permite movimientos contables' })
  permite_movimiento: boolean;

  @ApiProperty({ description: 'Requiere tercero' })
  requiere_tercero: boolean;

  @ApiProperty({ description: 'Requiere centro de costo' })
  requiere_centro_costo: boolean;

  @ApiPropertyOptional({ 
    description: 'Nodos hijos en la jerarquía',
    type: [NodoPucDto]
  })
  hijos?: NodoPucDto[];

  @ApiPropertyOptional({ description: 'Indica si el nodo está expandido' })
  expandido?: boolean;

  @ApiPropertyOptional({ description: 'Indica si tiene nodos hijos' })
  tiene_hijos?: boolean;
}

export class ArbolPucDto {
  @ApiProperty({
    description: 'Nodos del árbol jerárquico',
    type: [NodoPucDto]
  })
  nodos: NodoPucDto[];

  @ApiProperty({
    description: 'Total de nodos en el árbol',
    example: 125
  })
  total_nodos: number;
}