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
        console.log('🔗 Conectando a Supabase Transaction Pooler...');
        
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
            // Configuración específica para Transaction Pooler
            max: 10, // Máximo 10 conexiones simultáneas
            connectionTimeoutMillis: 30000, // 30 segundos timeout
            idleTimeoutMillis: 30000, // 30 segundos idle
          },
        };
      },
    }),
    ProveedoresModule,
    ProductosModule,
    OrdenesCompraModule,
    AuthModule,
    PucModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}