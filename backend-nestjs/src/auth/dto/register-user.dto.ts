// backend-nestjs/src/auth/dto/register-user.dto.ts

// No importamos nada de 'class-validator'
// import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class RegisterUserDto {
  // Eliminamos los decoradores de validación
  username: string;
  email: string;
  password: string;
}