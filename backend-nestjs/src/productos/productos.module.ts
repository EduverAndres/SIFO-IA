import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './producto.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  providers: [ProductosService],
  controllers: [ProductosController],
  exports: [ProductosService], // Exportar si otros módulos necesitan ProductosService
})
export class ProductosModule {}