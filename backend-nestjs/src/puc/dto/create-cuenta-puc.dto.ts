// backend-nestjs/src/puc/dto/create-cuenta-puc.dto.ts
import { IsString, IsOptional, IsEnum, IsBoolean, Length, Matches, IsNotEmpty, ValidateIf } from 'class-validator';
import { TipoCuenta, NaturalezaCuenta, EstadoCuenta } from '../entities/cuenta-puc.entity';

export class CreateCuentaPucDto {
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Length(1, 20, { message: 'El código debe tener entre 1 y 20 caracteres' })
  @Matches(/^[0-9]+$/, { message: 'El código debe contener solo números' })
  codigo: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @IsEnum(TipoCuenta, { message: 'Tipo de cuenta inválido' })
  tipo_cuenta: TipoCuenta;

  @IsEnum(NaturalezaCuenta, { message: 'Naturaleza de cuenta inválida' })
  naturaleza: NaturalezaCuenta;

  @IsOptional()
  @IsEnum(EstadoCuenta, { message: 'Estado de cuenta inválido' })
  estado?: EstadoCuenta = EstadoCuenta.ACTIVA;

  @IsOptional()
  @IsString({ message: 'El código padre debe ser una cadena de texto' })
  @ValidateIf((o) => o.codigo_padre !== null && o.codigo_padre !== '')
  @Matches(/^[0-9]+$/, { message: 'El código padre debe contener solo números' })
  codigo_padre?: string;

  @IsOptional()
  @IsBoolean({ message: 'Acepta movimientos debe ser verdadero o falso' })
  acepta_movimientos?: boolean = true;

  @IsOptional()
  @IsBoolean({ message: 'Requiere tercero debe ser verdadero o falso' })
  requiere_tercero?: boolean = false;

  @IsOptional()
  @IsBoolean({ message: 'Requiere centro costo debe ser verdadero o falso' })
  requiere_centro_costo?: boolean = false;

  @IsOptional()
  @IsString({ message: 'La dinámica debe ser una cadena de texto' })
  dinamica?: string;

  @IsOptional()
  @IsBoolean({ message: 'Es cuenta NIIF debe ser verdadero o falso' })
  es_cuenta_niif?: boolean = false;

  @IsOptional()
  @IsString({ message: 'El código NIIF debe ser una cadena de texto' })
  @ValidateIf((o) => o.es_cuenta_niif === true)
  codigo_niif?: string;
}
