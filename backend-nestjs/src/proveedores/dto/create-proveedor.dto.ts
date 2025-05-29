// backend-nestjs/src/proveedores/dto/create-proveedor.dto.ts
import { IsString, IsEmail, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class CreateProveedorDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'El contacto debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El contacto debe tener entre 1 y 255 caracteres' })
  contacto?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @Length(1, 255, { message: 'El correo debe tener entre 1 y 255 caracteres' })
  correo_electronico?: string;
}