import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { username, email, password } = registerUserDto;
    
    console.log(`🔥 [REGISTER] Intentando registrar: ${username} - ${email}`);

    // Verificar si username ya existe
    const existingUser = await this.usersRepository.findOne({ 
      where: { username } 
    });
    
    if (existingUser) {
      console.log(`❌ [REGISTER] Username ${username} ya existe`);
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Verificar si email ya existe
    const existingEmail = await this.usersRepository.findOne({ 
      where: { email } 
    });
    
    if (existingEmail) {
      console.log(`❌ [REGISTER] Email ${email} ya existe`);
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`🔐 [REGISTER] Password hasheada para ${username}`);

    // Crear usuario
    const newUser = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      rol: 'usuario'
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);
      console.log(`✅ [REGISTER] Usuario creado con ID: ${savedUser.id}`);
      
      // Retornar sin password
      const { password: _, ...result } = savedUser;
      return result;
    } catch (error) {
      console.error(`💥 [REGISTER] Error al guardar:`, error);
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    
    console.log(`🔥 [LOGIN] Intento de login: ${email}`);

    // Buscar usuario con password
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      console.log(`❌ [LOGIN] Usuario ${email} no encontrado`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log(`👤 [LOGIN] Usuario encontrado: ${user.username}`);

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔐 [LOGIN] Password válida: ${isValidPassword}`);

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
    console.log(`🎫 [LOGIN] JWT generado para ${user.username}`);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol
      }
    };
  }
}