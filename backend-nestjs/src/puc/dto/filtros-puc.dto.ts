// src/puc/dto/filtros-puc.dto.ts
import { IsOptional, IsString, IsBoolean, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltrosPucDto {
  @ApiPropertyOptional({ description: 'Buscar por código o nombre' })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Filtrar por naturaleza' })
  @IsOptional()
  @IsString()
  naturaleza?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Código padre' })
  @IsOptional()
  @IsString()
  codigo_padre?: string;

  @ApiPropertyOptional({ description: 'Solo cuentas de movimiento' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  solo_movimiento?: boolean;

  @ApiPropertyOptional({ description: 'Página', example: 1 })
  @IsOptional()
  @IsNumberString()
  pagina?: string = '1';

  @ApiPropertyOptional({ description: 'Elementos por página', example: 10000 })
  @IsOptional()
  @IsNumberString()
  limite?: string = '10000';
}

// Dentro de handleExportPuc
