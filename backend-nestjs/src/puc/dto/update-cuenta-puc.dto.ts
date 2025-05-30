// backend-nestjs/src/puc/dto/update-cuenta-puc.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCuentaPucDto } from './create-cuenta-puc.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { EstadoCuenta } from '../entities/cuenta-puc.entity';

export class UpdateCuentaPucDto extends PartialType(CreateCuentaPucDto) {
  @IsOptional()
  @IsEnum(EstadoCuenta, { message: 'Estado de cuenta inválido' })
  estado?: EstadoCuenta;
}