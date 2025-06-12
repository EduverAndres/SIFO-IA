// backend-nestjs/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    console.log('🚀🚀🚀 AuthController SE ESTÁ CARGANDO 🚀🚀🚀');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    console.log(`🎯 [CONTROLLER] POST /auth/register recibido`);
    console.log(`📄 [CONTROLLER] Datos:`, registerUserDto);
    
    try {
      const user = await this.authService.register(registerUserDto);
      console.log(`✅ [CONTROLLER] Registro exitoso`);
      
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user
      };
    } catch (error) {
      console.error(`💥 [CONTROLLER] Error en registro:`, error.message);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log(`🎯 [CONTROLLER] POST /auth/login recibido`);
    console.log(`📄 [CONTROLLER] Email:`, loginUserDto.email);
    
    try {
      const result = await this.authService.login(loginUserDto);
      console.log(`✅ [CONTROLLER] Login exitoso`);
      
      return {
        success: true,
        message: 'Login exitoso',
        data: result
      };
    } catch (error) {
      console.error(`💥 [CONTROLLER] Error en login:`, error.message);
      throw error;
    }
  }
}