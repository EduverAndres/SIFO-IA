// backend-nestjs/src/auth/auth.controller.ts - CORREGIDO
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('🔐 Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    console.log('🎯 AuthController inicializado');
  }

  @Get()
  @ApiOperation({ summary: 'Test del módulo de autenticación' })
  @ApiResponse({ status: 200, description: 'Módulo funcionando' })
  test() {
    console.log('📍 GET /api/v1/auth/ - Test solicitado');
    return {
      success: true,
      message: 'Módulo de autenticación funcionando',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/v1/auth/ - Test',
        'POST /api/v1/auth/login - Iniciar sesión',
        'POST /api/v1/auth/register - Registrar usuario'
      ]
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping de autenticación' })
  ping() {
    console.log('🏓 GET /api/v1/auth/ping');
    return { 
      message: 'Auth pong', 
      timestamp: new Date().toISOString() 
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    console.log(`📝 POST /api/v1/auth/register - Usuario: ${registerUserDto.username}`);
    
    try {
      const user = await this.authService.register(registerUserDto);
      console.log(`✅ Registro exitoso para: ${user.username}`);
      
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user
      };
    } catch (error) {
      console.error(`❌ Error en registro:`, error.message);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log(`🔑 POST /api/v1/auth/login - Email: ${loginUserDto.email}`);
    
    try {
      const result = await this.authService.login(loginUserDto);
      console.log(`✅ Login exitoso para: ${result.user.username}`);
      
      return {
        success: true,
        message: 'Login exitoso',
        data: result
      };
    } catch (error) {
      console.error(`❌ Error en login:`, error.message);
      throw error;
    }
  }
}