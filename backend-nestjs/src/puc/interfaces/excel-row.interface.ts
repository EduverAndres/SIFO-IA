// backend-nestjs/src/puc/interfaces/excel-row.interface.ts
export interface ExcelRowPuc {
  fila: number;
  saldo_inicial?: number;
  saldo_final?: number;
  codigo_clase?: string;
  codigo_grupo?: string;
  codigo_cuenta?: string;
  codigo_subcuenta?: string;
  codigo_detalle?: string;
  id_movimiento?: string;
  descripcion?: string;
  tipo_om?: string;
  centro_costos?: string;
  movimientos_debito?: number;
  movimientos_credito?: number;
  tipo_cta?: string;
  nivel?: number;
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
}

export interface ValidacionExcel {
  es_valido: boolean;
  errores: string[];
  advertencias: string[];
  resumen: {
    total_filas: number;
    filas_validas: number;
    filas_con_errores: number;
    clases_encontradas: number;
    grupos_encontrados: number;
    cuentas_encontradas: number;
    subcuentas_encontradas: number;
    detalles_encontrados: number;
  };
  datos_procesados: ExcelRowPuc[];
}

export interface ResultadoImportacion {
  exito: boolean;
  mensaje: string;
  resumen: {
    total_procesadas: number;
    insertadas: number;
    actualizadas: number;
    errores: number;
    omitidas: number;
  };
  errores: Array<{
    fila: number;
    codigo?: string;
    error: string;
  }>;
  advertencias: string[];
}