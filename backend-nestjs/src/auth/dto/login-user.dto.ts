// backend-nestjs/src/auth/dto/login-user.dto.ts

// No importamos nada de 'class-validator'
// import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginUserDto {
  // Eliminamos los decoradores de validación
  email: string;
  password: string;
}