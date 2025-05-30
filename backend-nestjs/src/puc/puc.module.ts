// backend-nestjs/src/puc/puc.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PucService } from './puc.service';
import { PucController } from './puc.controller';
import { CuentaPuc } from './entities/cuenta-puc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaPuc])],
  controllers: [PucController],
  providers: [PucService],
  exports: [PucService], // Para usar en otros módulos
})
export class PucModule {}