// backend-nestjs/src/ordenes-compra/orden-compra.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Proveedor } from '../proveedores/proveedor.entity';
import { DetalleOrden } from './detalle-orden.entity';
import { EstadoOrden } from './dto/update-estado-orden.dto';

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

  @Column({ 
    type: 'enum', 
    enum: EstadoOrden, 
    default: EstadoOrden.PENDIENTE 
  })
  estado: EstadoOrden;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0,
    nullable: false 
  })
  total: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => DetalleOrden, (detalle) => detalle.orden, { 
    cascade: true,
    onDelete: 'CASCADE'
  })
  detalles: DetalleOrden[];
}