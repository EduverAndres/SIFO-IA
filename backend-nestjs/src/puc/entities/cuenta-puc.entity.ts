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
  INACTIVA = 'INACTIVA'
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

  // ===============================================
  // 📊 CÓDIGOS JERÁRQUICOS DEL PUC (SEGÚN TEMPLATE DEL CLIENTE)
  // ===============================================

  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'Código de clase (1 dígito)' })
  @Index()
  codigo_clase: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'Código de grupo (2 dígitos)' })
  @Index()
  codigo_grupo: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'Código de cuenta (4 dígitos)' })
  @Index()
  codigo_cuenta: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'Código de subcuenta (6 dígitos)' })
  @Index()
  codigo_subcuenta: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'Código de detalle (8+ dígitos)' })
  @Index()
  codigo_detalle: string | null;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    unique: true,
    comment: 'Código completo de la cuenta (el más específico disponible)'
  })
  @Index()
  codigo_completo: string;

  // ===============================================
  // 📝 INFORMACIÓN BÁSICA
  // ===============================================

  @Column({ 
    type: 'varchar', 
    length: 500,
    comment: 'Nombre de la cuenta (DESCRIPCION del Excel)'
  })
  nombre: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Descripción detallada adicional'
  })
  descripcion: string | null;

  // ===============================================
  // ⚙️ CONFIGURACIÓN DE LA CUENTA
  // ===============================================

  @Column({ 
    type: 'enum', 
    enum: TipoCuentaEnum, 
    default: TipoCuentaEnum.DETALLE,
    comment: 'Tipo de cuenta según jerarquía'
  })
  @Index()
  tipo_cuenta: TipoCuentaEnum;

  @Column({ 
    type: 'enum', 
    enum: NaturalezaCuentaEnum, 
    default: NaturalezaCuentaEnum.DEBITO,
    comment: 'Naturaleza contable de la cuenta'
  })
  @Index()
  naturaleza: NaturalezaCuentaEnum;

  @Column({ 
    type: 'enum', 
    enum: EstadoCuentaEnum, 
    default: EstadoCuentaEnum.ACTIVA,
    comment: 'Estado actual de la cuenta'
  })
  @Index()
  estado: EstadoCuentaEnum;

  @Column({ 
    type: 'int', 
    default: 1,
    comment: 'Nivel jerárquico (NL del Excel)'
  })
  @Index()
  nivel: number;

  @Column({ 
    type: 'char', 
    length: 1, 
    default: 'D',
    comment: 'Tipo según Excel: G=Grupo, D=Detalle'
  })
  tipo_cta: string;

  // ===============================================
  // 🔗 RELACIÓN JERÁRQUICA
  // ===============================================

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    comment: 'Código del padre en la jerarquía'
  })
  @Index()
  codigo_padre: string | null;

  // ===============================================
  // 💰 CONFIGURACIONES DE MOVIMIENTOS
  // ===============================================

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Si la cuenta acepta movimientos contables'
  })
  @Index()
  acepta_movimientos: boolean;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: true,
    comment: 'ID de movimiento (I.D. del Excel)'
  })
  id_movimiento: string | null;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Si requiere información de tercero'
  })
  requiere_tercero: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Si requiere centro de costo'
  })
  requiere_centro_costo: boolean;

  // ===============================================
  // 💵 SALDOS Y MOVIMIENTOS (COLUMNAS DEL EXCEL)
  // ===============================================

  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0,
    comment: 'Saldo inicial (del Excel)'
  })
  saldo_inicial: number;

  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0,
    comment: 'Saldo final (del Excel)'
  })
  saldo_final: number;

  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0,
    comment: 'Movimientos débito (del Excel)'
  })
  movimientos_debito: number;

  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0,
    comment: 'Movimientos crédito (del Excel)'
  })
  movimientos_credito: number;

  // ===============================================
  // 🏢 CENTRO DE COSTOS (DEL EXCEL)
  // ===============================================

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: 'Centro de costos (del Excel)'
  })
  centro_costos: string | null;

  // ===============================================
  // 🏛️ INFORMACIÓN FISCAL (DEL EXCEL)
  // ===============================================

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Aplica para formulario F350'
  })
  aplica_f350: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Aplica para formulario F300'
  })
  aplica_f300: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Aplica para información exógena'
  })
  aplica_exogena: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Aplica para ICA'
  })
  aplica_ica: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Aplica para DR110'
  })
  aplica_dr110: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: 'Conciliación fiscal (del Excel)'
  })
  conciliacion_fiscal: string | null;

  // ===============================================
  // 📋 CAMPOS ADICIONALES DEL TEMPLATE
  // ===============================================

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: true,
    comment: 'Tipo OM del Excel'
  })
  tipo_om: string | null;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: true,
    comment: 'Código AT del Excel'
  })
  codigo_at: string | null;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: true,
    comment: 'Código CT del Excel'
  })
  codigo_ct: string | null;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: true,
    comment: 'Código CC del Excel'
  })
  codigo_cc: string | null;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: true,
    comment: 'Código TI del Excel'
  })
  codigo_ti: string | null;

  // ===============================================
  // 🌐 CONFIGURACIONES ADICIONALES NIIF
  // ===============================================

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Dinámica contable de la cuenta'
  })
  dinamica: string | null;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Si es cuenta NIIF'
  })
  es_cuenta_niif: boolean;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    comment: 'Código NIIF equivalente'
  })
  codigo_niif: string | null;

  // ===============================================
  // 🔧 CAMPOS DE CONTROL
  // ===============================================

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Si el registro está activo'
  })
  @Index()
  activo: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: 'Usuario que creó el registro'
  })
  usuario_creacion: string | null;

  @CreateDateColumn({ 
    type: 'timestamptz',
    comment: 'Fecha de creación del registro'
  })
  fecha_creacion: Date;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: 'Usuario que modificó el registro'
  })
  usuario_modificacion: string | null;

  @UpdateDateColumn({ 
    type: 'timestamptz',
    comment: 'Fecha de última modificación'
  })
  fecha_modificacion: Date;

  // ===============================================
  // 📊 METADATOS PARA IMPORTACIÓN
  // ===============================================

  @Column({ 
    type: 'int', 
    nullable: true,
    comment: 'Número de fila del Excel de origen'
  })
  fila_excel: number | null;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Observaciones adicionales'
  })
  observaciones: string | null;

  // ===============================================
  // 🔄 HOOKS DE ENTITY (SE EJECUTAN AUTOMÁTICAMENTE)
  // ===============================================

  @BeforeInsert()
  @BeforeUpdate()
  autoCompletarCampos() {
    // Auto-generar código completo si no está definido
    if (!this.codigo_completo) {
      const codigo = this.determinarCodigoCompleto();
      if (codigo) {
        this.codigo_completo = codigo;
      }
    }

    // Auto-determinar tipo de cuenta
    if (!this.tipo_cuenta) {
      this.tipo_cuenta = this.determinarTipoCuenta();
    }

    // Auto-determinar código padre
    if (!this.codigo_padre) {
      this.codigo_padre = this.determinarCodigoPadre();
    }

    // Auto-determinar nivel
    if (!this.nivel) {
      this.nivel = this.determinarNivel();
    }

    // Auto-determinar si acepta movimientos basado en tipo_cta
    if (this.tipo_cta === 'G') {
      this.acepta_movimientos = false;
    } else if (this.tipo_cta === 'D') {
      this.acepta_movimientos = true;
    } else if (this.tipo_cuenta === TipoCuentaEnum.DETALLE) {
      this.acepta_movimientos = this.acepta_movimientos ?? true;
    }

    // Auto-determinar naturaleza si no está definida
    if (!this.naturaleza && this.codigo_completo) {
      this.naturaleza = this.determinarNaturaleza();
    }
  }

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES PRIVADOS
  // ===============================================

  private determinarCodigoCompleto(): string | null {
    // Retorna el código más específico disponible
    if (this.codigo_detalle) return this.codigo_detalle;
    if (this.codigo_subcuenta) return this.codigo_subcuenta;
    if (this.codigo_cuenta) return this.codigo_cuenta;
    if (this.codigo_grupo) return this.codigo_grupo;
    if (this.codigo_clase) return this.codigo_clase;
    return null;
  }

  private determinarTipoCuenta(): TipoCuentaEnum {
    if (this.codigo_detalle) return TipoCuentaEnum.DETALLE;
    if (this.codigo_subcuenta) return TipoCuentaEnum.SUBCUENTA;
    if (this.codigo_cuenta) return TipoCuentaEnum.CUENTA;
    if (this.codigo_grupo) return TipoCuentaEnum.GRUPO;
    if (this.codigo_clase) return TipoCuentaEnum.CLASE;
    return TipoCuentaEnum.DETALLE;
  }

  private determinarCodigoPadre(): string | null {
    if (this.codigo_detalle) return this.codigo_subcuenta;
    if (this.codigo_subcuenta) return this.codigo_cuenta;
    if (this.codigo_cuenta) return this.codigo_grupo;
    if (this.codigo_grupo) return this.codigo_clase;
    return null;
  }

  private determinarNivel(): number {
    if (this.codigo_detalle) return 5;
    if (this.codigo_subcuenta) return 4;
    if (this.codigo_cuenta) return 3;
    if (this.codigo_grupo) return 2;
    if (this.codigo_clase) return 1;
    return 1;
  }

  private determinarNaturaleza(): NaturalezaCuentaEnum {
    const codigo = this.codigo_completo || this.determinarCodigoCompleto();
    if (!codigo) return NaturalezaCuentaEnum.DEBITO;

    const primerDigito = codigo.charAt(0);
    
    switch (primerDigito) {
      case '1': // Activos
      case '5': // Gastos
      case '6': // Costos
      case '7': // Costos de producción
        return NaturalezaCuentaEnum.DEBITO;
      case '2': // Pasivos
      case '3': // Patrimonio
      case '4': // Ingresos
      case '8': // Cuentas de orden deudoras
      case '9': // Cuentas de orden acreedoras
        return NaturalezaCuentaEnum.CREDITO;
      default:
        return NaturalezaCuentaEnum.DEBITO;
    }
  }

  // ===============================================
  // 📊 MÉTODOS DE UTILIDAD PÚBLICA
  // ===============================================

  getRutaJerarquica(): string {
    const partes: string[] = [];
    
    if (this.codigo_clase) partes.push(this.codigo_clase);
    if (this.codigo_grupo) partes.push(this.codigo_grupo);
    if (this.codigo_cuenta) partes.push(this.codigo_cuenta);
    if (this.codigo_subcuenta) partes.push(this.codigo_subcuenta);
    if (this.codigo_detalle) partes.push(this.codigo_detalle);
    
    return partes.join(' > ');
  }

  esHoja(): boolean {
    // Una cuenta es hoja si es del tipo DETALLE o si acepta movimientos
    return this.tipo_cuenta === TipoCuentaEnum.DETALLE || this.acepta_movimientos;
  }

  puedeEliminar(): boolean {
    // Una cuenta puede eliminarse si no tiene movimientos
    return (this.saldo_inicial || 0) === 0 && 
           (this.saldo_final || 0) === 0 && 
           (this.movimientos_debito || 0) === 0 && 
           (this.movimientos_credito || 0) === 0;
  }

  calcularSaldoFinal(): number {
    const saldoInicial = this.saldo_inicial || 0;
    const debitos = this.movimientos_debito || 0;
    const creditos = this.movimientos_credito || 0;
    
    if (this.naturaleza === NaturalezaCuentaEnum.CREDITO) {
      return saldoInicial - debitos + creditos;
    }
    
    return saldoInicial + debitos - creditos;
  }

  // Método para obtener información fiscal como objeto
  getInformacionFiscal(): {
    f350: boolean;
    f300: boolean;
    exogena: boolean;
    ica: boolean;
    dr110: boolean;
    conciliacion: string | null;
  } {
    return {
      f350: this.aplica_f350,
      f300: this.aplica_f300,
      exogena: this.aplica_exogena,
      ica: this.aplica_ica,
      dr110: this.aplica_dr110,
      conciliacion: this.conciliacion_fiscal
    };
  }

  // Método para validar integridad de la cuenta
  validarIntegridad(): { valida: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar código completo
    if (!this.codigo_completo) {
      errores.push('Código completo es requerido');
    }

    // Validar nombre
    if (!this.nombre || this.nombre.trim().length === 0) {
      errores.push('Nombre es requerido');
    }

    // Validar jerarquía
    if (this.codigo_padre) {
      const codigoPadreEsperado = this.determinarCodigoPadre();
      if (this.codigo_padre !== codigoPadreEsperado) {
        errores.push('Código padre no coincide con la jerarquía esperada');
      }
    }

    // Validar nivel
    const nivelEsperado = this.determinarNivel();
    if (this.nivel !== nivelEsperado) {
      errores.push('Nivel no coincide con la estructura del código');
    }

    return {
      valida: errores.length === 0,
      errores
    };
  }
}