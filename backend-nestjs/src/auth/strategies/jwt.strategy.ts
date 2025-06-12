// backend-nestjs/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity'; // ✅ LÍNEA CORREGIDA
import { Repository } from 'typeorm';

interface JwtPayload {
  sub: number; // ID del usuario
  username: string;
  rol: string;
  // ... cualquier otro campo que hayas incluido en el payload del JWT
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    const { sub: id } = payload;
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result; // Lo que retornes aquí se adjuntará a request.user
  }
}