// src/puc/dto/update-cuenta-puc.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCuentaPucDto } from './create-cuenta-puc.dto';

export class UpdateCuentaPucDto extends PartialType(
  OmitType(CreateCuentaPucDto, ['codigo'] as const)
) {}