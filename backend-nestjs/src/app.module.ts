// backend-nestjs/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// 📦 ENTIDADES
import { Proveedor } from './proveedores/proveedor.entity';
import { Producto } from './productos/producto.entity';
import { OrdenCompra } from './ordenes-compra/orden-compra.entity';
import { DetalleOrden } from './ordenes-compra/detalle-orden.entity';
import { User } from './auth/entities/user.entity';
import { CuentaPuc } from './puc/entities/cuenta-puc.entity';

// 🏗️ MÓDULOS
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProductosModule } from './productos/productos.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { AuthModule } from './auth/auth.module';
import { PucModule } from './puc/puc.module';
import { PucController } from './app.controller'; // o './puc/puc.controller' si lo moviste


// 🛠️ FILTROS E INTERCEPTORES
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    PucModule,
    // 🔧 CONFIGURACIÓN GLOBAL
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // 🗄️ CONFIGURACIÓN DE BASE DE DATOS - CORREGIDA PARA SUPABASE
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        console.log('🔗 Conectando a Supabase...');
        console.log('DATABASE_URL configurada:', databaseUrl ? '✅' : '❌');
        
        if (!databaseUrl) {
          throw new Error('❌ DATABASE_URL no está configurada en las variables de entorno');
        }
        
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [
            AuthModule,
            Proveedor,
            Producto,
            OrdenCompra,
            DetalleOrden,
            User,
            CuentaPuc, // ✅ Entidad PUC incluida
          ],
          synchronize: false, // ✅ DESHABILITADO para evitar problemas con Supabase
          logging: configService.get('NODE_ENV') === 'development',
          ssl: {
            rejectUnauthorized: false,
          },
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
            // Configuración optimizada para Supabase
            max: 5, // Máximo 5 conexiones
            connectionTimeoutMillis: 60000,
            idleTimeoutMillis: 10000,
            acquireTimeoutMillis: 60000,
            query_timeout: 30000,
            statement_timeout: 30000,
            application_name: 'sifo-backend',
            keepConnectionAlive: true,
          },
        };
      },
    }),

    // 📌 MÓDULOS DE LA APLICACIÓN
    AuthModule,           // ✅ Autenticación
    PucModule,            // ✅ Plan Único de Cuentas
    ProveedoresModule,    // ✅ Gestión de proveedores
    ProductosModule,      // ✅ Catálogo de productos
    OrdenesCompraModule,  // ✅ Órdenes de compra
  ],
  
  controllers: [], // Sin controladores globales
  
  providers: [
    // 🛡️ FILTROS GLOBALES DE EXCEPCIÓN
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    
    // 🔍 INTERCEPTORES GLOBALES
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('🏗️ AppModule inicializado correctamente');
    console.log('📦 Módulos cargados: Auth, PUC, Proveedores, Productos, Órdenes');
  }
}