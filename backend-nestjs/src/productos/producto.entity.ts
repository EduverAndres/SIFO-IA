// backend-nestjs/src/productos/producto.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetalleOrden } from '../ordenes-compra/detalle-orden.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'integer', default: 0, nullable: false })
  stock_actual: number;

  @Column({ type: 'integer', default: 0, nullable: false })
  stock_minimo: number;

  @Column({ type: 'integer', default: 100, nullable: false })
  stock_maximo: number;

  @OneToMany(() => DetalleOrden, (detalle) => detalle.producto)
  detallesOrden: DetalleOrden[];
}