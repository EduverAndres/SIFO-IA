import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { DetalleOrden } from './detalle-orden.entity';
import { OrdenesCompraService } from './ordenes-compra.service';
import { OrdenesCompraController } from './ordenes-compra.controller';
import { ProductosModule } from '../productos/productos.module'; // Importar ProductosModule
import { ProveedoresModule } from '../proveedores/proveedores.module'; // Importar ProveedoresModule

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdenCompra, DetalleOrden]),
    ProductosModule, // Para acceder a ProductoService
    ProveedoresModule, // Para acceder a ProveedorService
  ],
  providers: [OrdenesCompraService],
  controllers: [OrdenesCompraController],
})
export class OrdenesCompraModule {}