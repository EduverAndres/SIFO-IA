import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PucService } from './puc.service';
import { PucController } from './puc.controller';
import { CuentaPuc } from './entities/cuenta-puc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaPuc])],
  controllers: [PucController], // ← CRÍTICO: Debe estar aquí
  providers: [PucService],
  exports: [PucService]
})
export class PucModule {}