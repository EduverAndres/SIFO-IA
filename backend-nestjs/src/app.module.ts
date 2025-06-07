// backend-nestjs/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entidades
import { Proveedor } from './proveedores/proveedor.entity';
import { Producto } from './productos/producto.entity';
import { OrdenCompra } from './ordenes-compra/orden-compra.entity';
import { DetalleOrden } from './ordenes-compra/detalle-orden.entity';
import { User } from './auth/entities/user.entity';
import { CuentaPuc } from './puc/entities/cuenta-puc.entity';

// Módulos
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProductosModule } from './productos/productos.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { AuthModule } from './auth/auth.module';
import { PucModule } from './puc/puc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        console.log('🔗 Conectando a Supabase Session Pooler...');
        console.log('DATABASE_URL configurada:', databaseUrl ? '✓' : '✗');
        
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
          synchronize: false, // ⚠️ NUNCA true en producción
          logging: configService.get('NODE_ENV') === 'development',
          ssl: {
            rejectUnauthorized: false,
          },
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
            // Configuración optimizada para Session Pooler
            max: 5, // Máximo 5 conexiones simultáneas
            connectionTimeoutMillis: 60000, // 60 segundos
            idleTimeoutMillis: 10000, // 10 segundos idle
            acquireTimeoutMillis: 60000, // 60 segundos para obtener conexión
            query_timeout: 30000, // 30 segundos para queries
            statement_timeout: 30000, // 30 segundos para statements
            application_name: 'sifo-backend-render',
            // Configuración específica para evitar errores SCRAM
            keepConnectionAlive: true,
            dropSchema: false,
          },
        };
      },
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