  // backend-nestjs/src/auth/auth.module.ts
  import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { JwtModule } from '@nestjs/jwt';
  import { ConfigModule, ConfigService } from '@nestjs/config';
  import { AuthService } from './auth.service';
  import { AuthController } from './auth.controller';
  import { User } from './entities/user.entity';

  @Module({
    imports: [
      ConfigModule,
      TypeOrmModule.forFeature([User]),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
          signOptions: { 
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' 
          },
        }),
      }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
  })
  export class AuthModule {
    constructor() {
      console.log('🔥🔥🔥 AuthModule SE ESTÁ CARGANDO 🔥🔥🔥');
    }
  }