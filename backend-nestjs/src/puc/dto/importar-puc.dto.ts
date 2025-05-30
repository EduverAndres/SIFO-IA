// backend-nestjs/src/puc/dto/importar-puc.dto.ts
import { IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCuentaPucDto } from './create-cuenta-puc.dto';

export class ImportarPucDto {
  @IsArray({ message: 'Las cuentas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateCuentaPucDto)
  cuentas: CreateCuentaPucDto[];

  @IsOptional()
  @IsBoolean()
  sobrescribir_existentes?: boolean = false;

  @IsOptional()
  @IsBoolean()
  validar_jerarquia?: boolean = true;
}