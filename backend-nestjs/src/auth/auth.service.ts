// backend-nestjs/src/auth/auth.service.ts - CORREGIDO
import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.logger.log('🔥 AuthService inicializado');
  }

  async register(registerUserDto: RegisterUserDto) {
    const { username, email, password } = registerUserDto;
    
    this.logger.log(`📝 Registrando usuario: ${username} - ${email}`);

    try {
      // Verificar si username ya existe
      const existingUser = await this.usersRepository.findOne({ 
        where: { username } 
      });
      
      if (existingUser) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }

      // Verificar si email ya existe
      const existingEmail = await this.usersRepository.findOne({ 
        where: { email } 
      });
      
      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear usuario
      const newUser = this.usersRepository.create({
        username,
        email,
        password: hashedPassword,
        rol: 'usuario'
      });

      const savedUser = await this.usersRepository.save(newUser);
      this.logger.log(`✅ Usuario creado: ${savedUser.username}`);
      
      // Retornar sin password
      const { password: _, ...result } = savedUser;
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Error en registro: ${error.message}`);
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    
    this.logger.log(`🔑 Intento de login: ${email}`);

    try {
      // Buscar usuario con password
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Generar JWT
      const payload = { 
        sub: user.id, 
        username: user.username, 
        rol: user.rol 
      };
      
      const token = this.jwtService.sign(payload);
      this.logger.log(`✅ Login exitoso: ${user.username}`);

      return {
        access_token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rol: user.rol
        }
      };
      
    } catch (error) {
      this.logger.error(`❌ Error en login: ${error.message}`);
      throw error;
    }
  }
}