// backend-nestjs/src/app.module.ts - SIMPLE
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// ENTIDADES
import { Proveedor } from './proveedores/proveedor.entity';
import { Producto } from './productos/producto.entity';
import { OrdenCompra } from './ordenes-compra/orden-compra.entity';
import { DetalleOrden } from './ordenes-compra/detalle-orden.entity';
import { User } from './auth/entities/user.entity';
import { CuentaPuc } from './puc/entities/cuenta-puc.entity';

// MÓDULOS
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProductosModule } from './productos/productos.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { AuthModule } from './auth/auth.module';
import { PucModule } from './puc/puc.module';

// FILTROS
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (!databaseUrl) {
          throw new Error('DATABASE_URL requerida');
        }
        
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [
            Proveedor,
            Producto,
            OrdenCompra,
            DetalleOrden,
            User,
            CuentaPuc,
          ],
          synchronize: false,
          logging: false,
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
          },
        };
      },
    }),

    AuthModule,
    PucModule,
    ProveedoresModule,
    ProductosModule,
    OrdenesCompraModule,
  ],
  
  controllers: [],
  
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
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
export class AppModule {}