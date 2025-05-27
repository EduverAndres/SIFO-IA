import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './proveedor.entity';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  providers: [ProveedoresService],
  controllers: [ProveedoresController],
  exports: [ProveedoresService], // Exportar si otros módulos necesitan ProveedoresService
})
export class ProveedoresModule {}