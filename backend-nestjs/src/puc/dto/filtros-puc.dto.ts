// backend-nestjs/src/puc/dto/filtros-puc.dto.ts
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TipoCuenta, NaturalezaCuenta, EstadoCuenta } from '../entities/cuenta-puc.entity';

export class FiltrosPucDto {
  @IsOptional()
  @IsString()
  busqueda?: string;

  @IsOptional()
  @IsEnum(TipoCuenta)
  tipo_cuenta?: TipoCuenta;

  @IsOptional()
  @IsEnum(NaturalezaCuenta)
  naturaleza?: NaturalezaCuenta;

  @IsOptional()
  @IsEnum(EstadoCuenta)
  estado?: EstadoCuenta;

  @IsOptional()
  @IsString()
  codigo_padre?: string;

  @IsOptional()
  @Type(() => Number)
  nivel?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  solo_cuentas_movimiento?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  incluir_subcuentas?: boolean = true;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}