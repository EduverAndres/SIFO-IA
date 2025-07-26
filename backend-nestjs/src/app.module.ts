// backend-nestjs/src/app.module.ts - CON APPCONTROLLER
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importar controladores
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importar módulos
import { PucModule } from './puc/puc.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { AuthModule } from './auth/auth.module';

// Importar entidades
import { CuentaPuc } from './puc/entities/cuenta-puc.entity';
import { OrdenCompra } from './ordenes-compra/orden-compra.entity';
import { DetalleOrden } from './ordenes-compra/detalle-orden.entity';
import { Producto } from './productos/producto.entity';
import { Proveedor } from './proveedores/proveedor.entity';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con DATABASE_URL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'), // Usar DATABASE_URL directamente
        
        // Entidades registradas
        entities: [
          CuentaPuc,
          OrdenCompra,
          DetalleOrden,
          Producto,
          Proveedor,
          User,
        ],
        
        // Configuración para Supabase
        synchronize: true, // IMPORTANTE: siempre false en producción con Supabase
        logging: configService.get('NODE_ENV') === 'development',
        
        // SSL requerido para Supabase
        ssl: {
          rejectUnauthorized: false,
        },
        
        // Configuraciones de pooling
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
    AuthModule,
  ],
  controllers: [AppController], // ✅ AGREGAR APPCONTROLLER
  providers: [AppService], // ✅ AGREGAR APPSERVICE
})
export class AppModule {}