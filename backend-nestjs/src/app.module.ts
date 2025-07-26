// backend-nestjs/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importar módulos
import { PucModule } from './puc/puc.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

// Importar entidades
import { CuentaPuc } from './puc/entities/cuenta-puc.entity';
import { OrdenCompra } from './ordenes-compra/orden-compra.entity';
import { DetalleOrden } from './ordenes-compra/detalle-orden.entity';
import { Producto } from './productos/producto.entity';
import { Proveedor } from './proveedores/proveedor.entity';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'ordenes_compra_db'),
        
        // Entidades registradas
        entities: [
          CuentaPuc,      // Nueva entidad PUC
          OrdenCompra,
          DetalleOrden,
          Producto,
          Proveedor,
        ],
        
        // Configuración de desarrollo
        synchronize: configService.get('NODE_ENV') !== 'production', // Solo en desarrollo
        logging: configService.get('NODE_ENV') === 'development',
        
        // Configuraciones adicionales para PostgreSQL
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        
        // Configuraciones de timezone
        timezone: 'America/Bogota',
        
        // Configuraciones de pooling para mejor rendimiento
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
        },
      }),
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    PucModule,
    OrdenesCompraModule,
    ProductosModule,
    ProveedoresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}