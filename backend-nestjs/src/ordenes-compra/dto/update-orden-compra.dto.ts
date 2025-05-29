// backend-nestjs/src/ordenes-compra/dto/update-orden-compra.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenCompraDto } from './create-orden-compra.dto';

export class UpdateOrdenCompraDto extends PartialType(CreateOrdenCompraDto) {}