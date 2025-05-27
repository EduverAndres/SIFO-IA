// backend-nestjs/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProductosModule } from './productos/productos.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { Proveedor } from './proveedores/proveedor.entity';
import { Producto } from './productos/producto.entity';
import { OrdenCompra } from './ordenes-compra/orden-compra.entity';
import { DetalleOrden } from './ordenes-compra/detalle-orden.entity';

// --- NUEVAS IMPORTACIONES PARA AUTENTICACIÓN ---
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        // Proporciona valores por defecto si la variable de entorno es undefined
        host: config.get<string>('DB_HOST', 'localhost'), // Valor por defecto 'localhost'
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10), // Valor por defecto '3306'
        username: config.get<string>('DB_USERNAME', 'root'), // Valor por defecto 'root'
        password: config.get<string>('DB_PASSWORD', 'your_mysql_password'), // ¡CAMBIA ESTO!
        database: config.get<string>('DB_DATABASE', 'your_mysql_database'), // ¡CAMBIA ESTO!
        entities: [
          Proveedor,
          Producto,
          OrdenCompra,
          DetalleOrden,
          User,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    ProveedoresModule,
    ProductosModule,
    OrdenesCompraModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}