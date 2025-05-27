import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Proveedor } from '../proveedores/proveedor.entity';
import { DetalleOrden } from './detalle-orden.entity';

@Entity('ordenes_compra')
export class OrdenCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.ordenesCompra)
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_orden: Date;

  @Column({ type: 'datetime', nullable: false })
  fecha_entrega: Date;

  @Column({ length: 255, nullable: true })
  archivo_adjunto_url: string;

  // related_name="detalles" equivalente en TypeORM
  @OneToMany(() => DetalleOrden, (detalle) => detalle.orden, { cascade: true })
  detalles: DetalleOrden[];
}