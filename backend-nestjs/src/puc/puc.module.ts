// backend-nestjs/src/puc/puc.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaPuc } from './entities/cuenta-puc.entity';
import { PucService } from './puc.service';
import { PucController } from './puc.controller';
import { PucExcelService } from './services/puc-excel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaPuc])
  ],
  providers: [
    PucService,
    PucExcelService
  ],
  controllers: [PucController],
  exports: [
    PucService,
    PucExcelService,
    TypeOrmModule // Exportar TypeOrmModule para que otros módulos puedan usar la entidad
  ]
})
export class PucModule {}