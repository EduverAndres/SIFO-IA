// backend-nestjs/src/auth/auth.service.ts
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

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password } = registerUserDto;
    console.log(`[DEBUG - Register] Intentando registrar usuario: ${username}, email: ${email}`); // DEBUG

    const existingUserByUsername = await this.usersRepository.findOne({ where: { username } });
    if (existingUserByUsername) {
      console.log(`[DEBUG - Register] Username ${username} ya existe.`); // DEBUG
      throw new ConflictException('El nombre de usuario ya está en uso. Por favor, elige otro.');
    }

    const existingUserByEmail = await this.usersRepository.findOne({ where: { email } });
    if (existingUserByEmail) {
      console.log(`[DEBUG - Register] Email ${email} ya registrado.`); // DEBUG
      throw new ConflictException('El correo electrónico ya está registrado. Intenta iniciar sesión.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`[DEBUG - Register] Contraseña hasheada para ${username}: ${hashedPassword}`); // DEBUG

    const newUser = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      rol: 'usuario', // Asegúrate de que el rol por defecto se establezca aquí o en la entidad
    });

    try {
      await this.usersRepository.save(newUser);
      console.log(`[DEBUG - Register] Usuario ${username} guardado exitosamente. ID: ${newUser.id}`); // DEBUG
      return newUser;
    } catch (error) {
      console.error('[DEBUG - Register] Error al guardar el nuevo usuario:', error); // DEBUG
      // Error más general si falla la BD por otras razones
      throw new BadRequestException('Error al registrar el usuario. Por favor, inténtalo de nuevo.');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    console.log(`[DEBUG - Validate] Inicio de validateUser para email: "${email}"`); // DEBUG
    
    // Es crucial seleccionar explícitamente la columna 'password' ya que en la entidad está con select: false
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email }) // Buscar por email
      .getOne();

    if (!user) {
      console.log(`[DEBUG - Validate] Usuario con email "${email}" NO encontrado en la base de datos.`); // DEBUG
      return null;
    }
    
    console.log(`[DEBUG - Validate] Usuario "${user.username}" encontrado por email.`); // DEBUG
    console.log(`[DEBUG - Validate] Contraseña recibida (del input/Postman): "${pass}"`); // DEBUG
    console.log(`[DEBUG - Validate] Contraseña hasheada en BD (de user.password): "${user.password}"`); // DEBUG

    // Compara la contraseña proporcionada con la hasheada en la base de datos
    const isMatch = await bcrypt.compare(pass, user.password);

    console.log(`[DEBUG - Validate] Resultado de bcrypt.compare: ${isMatch}`); // DEBUG

    if (isMatch) {
      // Si la contraseña coincide, devuelve el objeto de usuario (sin la contraseña hasheada)
      const { password, ...result } = user;
      return result;
    }
    return null; // Contraseña incorrecta
  }

  async login(loginUserDto: LoginUserDto) {
    console.log(`[DEBUG - Login Controller] Recibida solicitud de login para email: ${loginUserDto.email}`); // DEBUG
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);

    if (!user) {
      console.log(`[DEBUG - Login Controller] Falló la validación del usuario para: ${loginUserDto.email}`); // DEBUG
      throw new UnauthorizedException('Credenciales inválidas: Correo electrónico o contraseña incorrectos.');
    }
    console.log(`[DEBUG - Login Controller] Usuario validado y listo para generar JWT: ${user.username}`); // DEBUG

    const payload = { username: user.username, sub: user.id, rol: user.rol };
    console.log(`[DEBUG - Login Controller] Payload para JWT:`, payload); // DEBUG

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
      },
    };
  }
}