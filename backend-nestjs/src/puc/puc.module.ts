// backend-nestjs/src/puc/puc.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PucController } from './puc.controller';
import { PucService } from './puc.service';
import { PucExcelService } from './services/puc-excel.service';
import { CuentaPuc } from './entities/cuenta-puc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaPuc])
  ],
  controllers: [PucController],
  providers: [PucService, PucExcelService],
  exports: [PucService, PucExcelService]
})
export class PucModule {}