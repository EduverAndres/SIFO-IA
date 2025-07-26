// backend-nestjs/src/puc/interfaces/excel-row.interface.ts - CORREGIDA
export interface ExcelRowPuc {
  codigo_completo?: string;
  nombre?: string;
  codigo_clase?: string;
  codigo_grupo?: string;
  codigo_cuenta?: string;
  codigo_subcuenta?: string;
  codigo_detalle?: string;
  nivel?: number;
  tipo_cta?: string;
  saldo_inicial?: number;
  saldo_final?: number;
  movimientos_debito?: number;
  movimientos_credito?: number;
  centro_costos?: string;
  id_movimiento?: string;
  tipo_om?: string;
  codigo_at?: string;
  codigo_ct?: string;
  codigo_cc?: string;
  codigo_ti?: string;
  aplica_f350?: boolean;
  aplica_f300?: boolean;
  aplica_exogena?: boolean;
  aplica_ica?: boolean;
  aplica_dr110?: boolean;
  conciliacion_fiscal?: string;
  fila?: number;
}

export interface ValidacionExcel {
  es_valido: boolean;
  errores: string[];
  advertencias: string[];
  total_filas: number;
}

export interface ErrorImportacion {
  fila: number;
  error: string;
}

export interface ResumenImportacion {
  total_procesadas: number;
  insertadas: number;
  actualizadas: number;
  errores: number;
  omitidas: number;
  tiempo_procesamiento?: number;
}

export interface ResultadoImportacion {
  exito: boolean;
  mensaje: string;
  resumen: ResumenImportacion;
  errores: ErrorImportacion[];
  advertencias: string[];
  archivo_procesado?: string;
  fecha_procesamiento?: Date;
}

export interface EstadisticasImportacion {
  cuentas_por_nivel: Record<number, number>;
  cuentas_por_clase: Record<string, number>;
  total_saldo_inicial: number;
  total_saldo_final: number;
  cuentas_con_saldos: number;
  cuentas_fiscales: {
    f350: number;
    f300: number;
    exogena: number;
    ica: number;
    dr110: number;
  };
}