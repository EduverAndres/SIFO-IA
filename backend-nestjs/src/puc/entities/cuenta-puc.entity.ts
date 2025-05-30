// backend-nestjs/src/puc/entities/cuenta-puc.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TipoCuenta {
  CLASE = 'CLASE',
  GRUPO = 'GRUPO', 
  CUENTA = 'CUENTA',
  SUBCUENTA = 'SUBCUENTA',
  AUXILIAR = 'AUXILIAR'
}

export enum NaturalezaCuenta {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO'
}

export enum EstadoCuenta {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA'
}

@Entity('cuentas_puc')
@Index(['codigo'])
@Index(['codigo_padre'])
@Index(['estado'])
@Index(['tipo_cuenta'])
export class CuentaPuc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: TipoCuenta,
    default: TipoCuenta.AUXILIAR
  })
  tipo_cuenta: TipoCuenta;

  @Column({
    type: 'enum',
    enum: NaturalezaCuenta
  })
  naturaleza: NaturalezaCuenta;

  @Column({
    type: 'enum',
    enum: EstadoCuenta,
    default: EstadoCuenta.ACTIVA
  })
  estado: EstadoCuenta;

  @Column({ type: 'integer', default: 1 })
  nivel: number;

  @Column({ length: 20, nullable: true })
  codigo_padre: string;

  @Column({ type: 'boolean', default: true })
  acepta_movimientos: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_tercero: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_centro_costo: boolean;

  @Column({ type: 'text', nullable: true })
  dinamica: string;

  @Column({ type: 'boolean', default: false })
  es_cuenta_niif: boolean;

  @Column({ length: 20, nullable: true })
  codigo_niif: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => CuentaPuc, cuenta => cuenta.subcuentas, { 
    nullable: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'codigo_padre', referencedColumnName: 'codigo' })
  cuenta_padre: CuentaPuc;

  @OneToMany(() => CuentaPuc, cuenta => cuenta.cuenta_padre)
  subcuentas: CuentaPuc[];

  // Métodos de utilidad
  getNombreCompleto(): string {
    return `${this.codigo} - ${this.nombre}`;
  }

  esHoja(): boolean {
    return !this.subcuentas || this.subcuentas.length === 0;
  }

  getClase(): string {
    return this.codigo.charAt(0);
  }

  getGrupo(): string {
    return this.codigo.substring(0, 2);
  }

  getCuenta(): string {
    return this.codigo.substring(0, 4);
  }

  getSubcuenta(): string {
    return this.codigo.substring(0, 6);
  }
}