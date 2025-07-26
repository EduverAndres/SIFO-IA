// backend-nestjs/src/puc/dto/update-cuenta-puc.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateCuentaPucDto } from './create-cuenta-puc.dto';

export class UpdateCuentaPucDto extends PartialType(CreateCuentaPucDto) {}