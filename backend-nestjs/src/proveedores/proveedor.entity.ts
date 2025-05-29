// backend-nestjs/src/proveedores/proveedor.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrdenCompra } from '../ordenes-compra/orden-compra.entity';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  nombre: string;

  @Column({ length: 255, nullable: true })
  contacto: string;

  @Column({ length: 255, unique: true, nullable: true })
  correo_electronico: string;

  @OneToMany(() => OrdenCompra, (orden) => orden.proveedor)
  ordenesCompra: OrdenCompra[];
}