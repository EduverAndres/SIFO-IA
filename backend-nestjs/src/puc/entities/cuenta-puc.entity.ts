// backend-nestjs/src/puc/entities/cuenta-puc.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';

export enum TipoCuentaEnum {
  CLASE = 'CLASE',
  GRUPO = 'GRUPO', 
  CUENTA = 'CUENTA',
  SUBCUENTA = 'SUBCUENTA',
  DETALLE = 'DETALLE',
  AUXILIAR = 'AUXILIAR'
}

export enum NaturalezaCuentaEnum {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO'
}

export enum EstadoCuentaEnum {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  BLOQUEADA = 'BLOQUEADA'
}

@Entity('cuentas_puc')
@Index(['codigo_completo'], { unique: true })
@Index(['codigo_clase'])
@Index(['codigo_grupo'])
@Index(['codigo_cuenta'])
@Index(['codigo_subcuenta'])
@Index(['codigo_detalle'])
@Index(['codigo_padre'])
@Index(['estado'])
@Index(['tipo_cuenta'])
@Index(['naturaleza'])
@Index(['nivel'])
@Index(['acepta_movimientos'])
@Index(['activo'])
export class CuentaPuc {
  @PrimaryGeneratedColumn()
  id: number;

  // JERARQUÍA PUC
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_clase: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_grupo: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_cuenta: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_subcuenta: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_detalle: string | null;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo_completo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_padre: string | null;

  // SOLO DESCRIPCION (SIN NOMBRE)
  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  // CLASIFICACIÓN CONTABLE
  @Column({ type: 'enum', enum: TipoCuentaEnum, default: TipoCuentaEnum.DETALLE })
  tipo_cuenta: TipoCuentaEnum;

  @Column({ type: 'enum', enum: NaturalezaCuentaEnum, default: NaturalezaCuentaEnum.DEBITO })
  naturaleza: NaturalezaCuentaEnum;

  @Column({ type: 'enum', enum: EstadoCuentaEnum, default: EstadoCuentaEnum.ACTIVA })
  estado: EstadoCuentaEnum;

  @Column({ type: 'int', default: 1 })
  nivel: number;

  @Column({ type: 'char', length: 1, default: 'D' })
  tipo_cta: string;

  // CONFIGURACIÓN OPERATIVA
  @Column({ type: 'boolean', default: true })
  acepta_movimientos: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  id_movimiento: string | null;

  @Column({ type: 'boolean', default: false })
  requiere_tercero: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_centro_costo: boolean;

  // DATOS FINANCIEROS
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo_inicial: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo_final: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  movimientos_debito: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  movimientos_credito: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  centro_costos: string | null;

  // APLICACIONES NORMATIVAS
  @Column({ type: 'boolean', default: false })
  aplica_dr110: boolean;

  @Column({ type: 'boolean', default: false })
  aplica_f350: boolean;

  @Column({ type: 'boolean', default: false })
  aplica_f300: boolean;

  @Column({ type: 'boolean', default: false })
  aplica_exogena: boolean;

  @Column({ type: 'boolean', default: false })
  aplica_ica: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  conciliacion_fiscal: string | null;

  // CÓDIGOS TÉCNICOS DIAN
  @Column({ type: 'varchar', length: 10, nullable: true })
  tipo_om: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_at: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_ct: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_cc: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_ti: string | null;

  // NIIF
  @Column({ type: 'boolean', default: false })
  es_cuenta_niif: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_niif: string | null;

  @Column({ type: 'text', nullable: true })
  dinamica: string | null;

  // CAMPOS DE CONTROL
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_creacion: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_modificacion: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  fecha_modificacion: Date;

  @Column({ type: 'int', nullable: true })
  fila_excel: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // MÉTODO CORREGIDO
  matchesBusqueda(termino: string): boolean {
    const terminoLower = termino.toLowerCase();
    return this.codigo_completo.toLowerCase().includes(terminoLower) ||
           (this.descripcion?.toLowerCase().includes(terminoLower) ?? false);
  }

  // Otros métodos auxiliares...
  determinarNaturaleza(): NaturalezaCuentaEnum {
    const primerDigito = this.codigo_completo.charAt(0);
    
    switch (primerDigito) {
      case '1':
      case '5':
      case '6':
      case '7':
        return NaturalezaCuentaEnum.DEBITO;
      case '2':
      case '3':
      case '4':
      case '8':
      case '9':
        return NaturalezaCuentaEnum.CREDITO;
      default:
        return NaturalezaCuentaEnum.DEBITO;
    }
  }
}
