// backend-nestjs/src/app.module.ts - VERSIÓN DE DIAGNÓSTICO
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// 🐛 CONTROLADOR DE DIAGNÓSTICO
import { DebugController } from './debug.controller';
import { AppService } from './app.service';

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

// 🛠️ FILTROS E INTERCEPTORES
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    // 🔧 CONFIGURACIÓN GLOBAL
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // 🗄️ CONFIGURACIÓN DE BASE DE DATOS
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        console.log('🔗 Conectando a Supabase...');
        console.log('DATABASE_URL configurada:', databaseUrl ? '✅' : '❌');
        
        if (!databaseUrl) {
          console.warn('⚠️ DATABASE_URL no configurada, usando configuración mock');
          return {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'test',
            password: 'test',
            database: 'test',
            entities: [Proveedor, Producto, OrdenCompra, DetalleOrden, User, CuentaPuc],
            synchronize: false,
            logging: false,
          };
        }
        
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [Proveedor, Producto, OrdenCompra, DetalleOrden, User, CuentaPuc],
          synchronize: false,
          logging: configService.get('NODE_ENV') === 'development',
          ssl: {
            rejectUnauthorized: false,
          },
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
            max: 5,
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

    // 📌 MÓDULOS DE LA APLICACIÓN (TEMPORALMENTE COMENTADOS PARA DIAGNÓSTICO)
    AuthModule,
    // PucModule,
    // ProveedoresModule,
    // ProductosModule,
    // OrdenesCompraModule,
  ],
  
  controllers: [
    DebugController, // 🐛 CONTROLADOR DE DIAGNÓSTICO COMO PRINCIPAL
  ],
  
  providers: [
    AppService,
    
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
    console.log('🐛 DEBUG AppModule inicializado');
    console.log('🐛 DebugController registrado para manejar ruta raíz');
    console.log('🐛 Módulos activos: Auth solamente (resto comentado)');
  }
}