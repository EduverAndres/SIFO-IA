// backend-nestjs/src/ordenes-compra/detalle-orden.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Producto } from '../productos/producto.entity';

@Entity('detalles_orden')
export class DetalleOrden {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_orden' })
  orden: OrdenCompra;

  @ManyToOne(() => Producto, (producto) => producto.detallesOrden)
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column({ type: 'integer', nullable: false })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio_unitario: number;
}