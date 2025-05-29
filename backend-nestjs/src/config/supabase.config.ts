// backend-nestjs/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// --- IMPORTAR ENTIDADES ---
import { Proveedor } from '../proveedores/proveedor.entity';
import { Producto } from '../productos/producto.entity';
import { OrdenCompra } from '../ordenes-compra/orden-compra.entity';
import { DetalleOrden } from '../ordenes-compra/detalle-orden.entity';
import { User } from '../auth/entities/user.entity';

// --- IMPORTAR MÓDULOS ---
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { ProductosModule } from '../productos/productos.module';
import { OrdenesCompraModule } from '../ordenes-compra/ordenes-compra.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('SUPABASE_DB_HOST'),
        port: configService.get<number>('SUPABASE_DB_PORT') || 5432,
        username: configService.get<string>('SUPABASE_DB_USER'),
        password: configService.get<string>('SUPABASE_DB_PASSWORD'),
        database: configService.get<string>('SUPABASE_DB_NAME'),
        entities: [
          Proveedor,
          Producto,
          OrdenCompra,
          DetalleOrden,
          User,
        ],
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    // Aquí van los módulos importados arriba
    ProveedoresModule,
    ProductosModule,
    OrdenesCompraModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}