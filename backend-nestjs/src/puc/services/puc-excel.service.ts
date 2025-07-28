// backend-nestjs/src/puc/services/puc-excel.service.ts - COMPLETAMENTE CORREGIDO
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CuentaPuc } from '../entities/cuenta-puc.entity';
import { ImportPucExcelDto } from '../dto/import-puc-excel.dto';
import { ExportPucExcelDto } from '../dto/export-puc-excel.dto';
import { 
  ValidacionExcel, 
  ResultadoImportacion 
} from '../interfaces/excel-row.interface';
import { TipoCuentaEnum, NaturalezaCuentaEnum, EstadoCuentaEnum } from '../entities/cuenta-puc.entity';

// Mapeo de columnas actualizado SIN CAMPO NOMBRE
interface ExcelColumnMapping {
  saldo_inicial: number;      // Columna 0 (A)
  saldo_final: number;        // Columna 1 (B)
  codigo_clase: number;       // Columna 2 (C)
  codigo_grupo: number;       // Columna 3 (D)
  codigo_cuenta: number;      // Columna 4 (E)
  codigo_subcuenta: number;   // Columna 5 (F)
  codigo_detalle: number;     // Columna 6 (G)
  id_movimiento: number;      // Columna 7 (H) - I.D.
  descripcion: number;        // Columna 8 (I) - DESCRIPCION (CAMBIADO DE 'nombre')
  tipo_om: number;            // Columna 9 (J) - TC$/OM
  centro_costos: number;      // Columna 10 (K)
  movimientos_debito: number; // Columna 11 (L)
  movimientos_credito: number;// Columna 12 (M)
  tipo_cta: number;           // Columna 13 (N) - Tipo/Cta
  nivel: number;              // Columna 14 (O) - NL
  codigo_at: number;          // Columna 15 (P) - AT
  codigo_ct: number;          // Columna 16 (Q) - CT
  codigo_cc: number;          // Columna 17 (R) - CC
  codigo_ti: number;          // Columna 18 (S) - TI
  aplica_f350: number;        // Columna 19 (T) - F350
  aplica_f300: number;        // Columna 20 (U) - F300
  aplica_exogena: number;     // Columna 21 (V) - Exogena
  aplica_ica: number;         // Columna 22 (W) - ICA
  aplica_dr110: number;       // Columna 23 (X) - DR(110)
  conciliacion_fiscal: number;// Columna 24 (Y) - Conciliacion Fiscal
}

interface FilaProcesada {
  codigo_completo: string;
  descripcion: string;        // CAMBIADO DE 'nombre' A 'descripcion'
  codigo_clase: string | null;
  codigo_grupo: string | null;
  codigo_cuenta: string | null;
  codigo_subcuenta: string | null;
  codigo_detalle: string | null;
  nivel: number;
  tipo_cta: string;
  naturaleza: NaturalezaCuentaEnum;
  tipo_cuenta: TipoCuentaEnum;
  codigo_padre: string | null;
  acepta_movimientos: boolean;
  saldo_inicial: number;
  saldo_final: number;
  movimientos_debito: number;
  movimientos_credito: number;
  centro_costos: string | null;
  id_movimiento: string | null;
  tipo_om: string | null;
  codigo_at: string | null;
  codigo_ct: string | null;
  codigo_cc: string | null;
  codigo_ti: string | null;
  aplica_f350: boolean;
  aplica_f300: boolean;
  aplica_exogena: boolean;
  aplica_ica: boolean;
  aplica_dr110: boolean;
  conciliacion_fiscal: string | null;
  fila_excel: number;
}

@Injectable()
export class PucExcelService {
  private readonly logger = new Logger(PucExcelService.name);

  // Mapeo actualizado SIN NOMBRE
  private readonly COLUMN_MAPPING: ExcelColumnMapping = {
    saldo_inicial: 0,
    saldo_final: 1,
    codigo_clase: 2,
    codigo_grupo: 3,
    codigo_cuenta: 4,
    codigo_subcuenta: 5,
    codigo_detalle: 6,
    id_movimiento: 7,
    descripcion: 8,        // CAMBIADO DE 'nombre' A 'descripcion'
    tipo_om: 9,
    centro_costos: 10,
    movimientos_debito: 11,
    movimientos_credito: 12,
    tipo_cta: 13,
    nivel: 14,
    codigo_at: 15,
    codigo_ct: 16,
    codigo_cc: 17,
    codigo_ti: 18,
    aplica_f350: 19,
    aplica_f300: 20,
    aplica_exogena: 21,
    aplica_ica: 22,
    aplica_dr110: 23,
    conciliacion_fiscal: 24
  };

  constructor(
    @InjectRepository(CuentaPuc)
    private cuentaPucRepository: Repository<CuentaPuc>
  ) {}

  // ===============================================
  // 📥 MÉTODOS DE IMPORTACIÓN PRINCIPALES
  // ===============================================

  async importarDesdeExcel(
    file: MulterFile, // ✅ CORREGIDO
    opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    this.logger.log(`🔄 Iniciando importación de ${file.originalname}`);
    
    try {
      // 1. Validar archivo primero
      const validacion = await this.validarArchivoExcel(file, 'PUC');
      if (!validacion.es_valido) {
        throw new BadRequestException(`Archivo inválido: ${validacion.errores.join(', ')}`);
      }

      // 2. Procesar filas del Excel
      const filasValidas = await this.procesarFilasExcel(file, opciones);

      // 3. Crear o actualizar cuentas
      const resultado = await this.crearActualizarCuentas(filasValidas, opciones);

      this.logger.log(`✅ Importación completada: ${resultado.resumen.insertadas} cuentas`);
      return resultado;

    } catch (error) {
      this.logger.error(`❌ Error en importación: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al importar PUC: ${error.message}`);
    }
  }

  async validarArchivoExcel(
    file: MulterFile, // ✅ CORREGIDO
    nombreHoja: string = 'PUC'
  ): Promise<ValidacionExcel> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Verificar que existe la hoja especificada
      if (!workbook.SheetNames.includes(nombreHoja)) {
        errores.push(`No se encontró la hoja "${nombreHoja}". Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
      }

      const worksheet = workbook.Sheets[nombreHoja];
      if (!worksheet) {
        errores.push(`La hoja "${nombreHoja}" está vacía`);
        return { es_valido: false, errores, advertencias, total_filas: 0 };
      }

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const filasEncontradas = range.e.r + 1;

      // Verificar estructura mínima
      if (filasEncontradas < 3) {
        errores.push('El archivo debe tener al menos 3 filas (headers + 1 fila de datos)');
      }

      // Verificar headers
      const primeraFila = this.extraerFilaExcel(worksheet, 0, range.e.c);
      const segundaFila = this.extraerFilaExcel(worksheet, 1, range.e.c);

      if (!primeraFila.includes('CLASE') || !segundaFila.includes('C (1)')) {
        advertencias.push('Los headers no coinciden exactamente con el template recomendado');
      }

      return {
        es_valido: errores.length === 0,
        errores,
        advertencias,
        total_filas: filasEncontradas - 2 // Restar headers
      };

    } catch (error) {
      return {
        es_valido: false,
        errores: [`Error al leer archivo: ${error.message}`],
        advertencias: [],
        total_filas: 0
      };
    }
  }

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN CORREGIDOS
  // ===============================================

  async exportarAExcel(opciones: ExportPucExcelDto): Promise<Buffer> {
    try {
      this.logger.log('🔄 Iniciando exportación de PUC a Excel con opciones:', opciones);

      // 1. Validar que las opciones sean coherentes
      this.validarOpcionesExportacion(opciones);

      // 2. Obtener cuentas con filtros aplicados
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      // Aplicar filtros según las opciones
      if (opciones.filtro_estado) {
        query.andWhere('cuenta.estado = :estado', { estado: opciones.filtro_estado });
      }

      if (opciones.filtro_tipo) {
        query.andWhere('cuenta.tipo_cuenta = :tipo', { tipo: opciones.filtro_tipo });
      }

      if (opciones.filtro_clase) {
        // Filtrar por clase usando codigo_completo que empiece con la clase
        query.andWhere('cuenta.codigo_completo LIKE :clase', { clase: `${opciones.filtro_clase}%` });
      }

      if (opciones.solo_movimientos) {
        // Solo cuentas que acepten movimientos Y que tengan movimientos reales
        query.andWhere('cuenta.acepta_movimientos = :acepta', { acepta: true });
        query.andWhere('(cuenta.movimientos_debito > 0 OR cuenta.movimientos_credito > 0)');
      }

      if (!opciones.incluir_inactivas) {
        query.andWhere('cuenta.estado != :inactivo', { inactivo: EstadoCuentaEnum.INACTIVA });
      }

      // Ordenar por código completo para mantener jerarquía
      query.orderBy('cuenta.codigo_completo', 'ASC');
      const cuentas = await query.getMany();

      if (cuentas.length === 0) {
        throw new BadRequestException('No se encontraron cuentas para exportar con los filtros especificados');
      }

      this.logger.log(`📊 Procesando ${cuentas.length} cuentas para exportación`);

      // 3. Generar datos Excel usando la misma estructura del template
      const datos = this.generarDatosTemplate(false); // Headers sin ejemplos
      const cols = datos[0].length;

      // 4. Procesar cada cuenta manteniendo formato exacto del template
      for (const cuenta of cuentas) {
        const fila = Array(cols).fill('');

        // COLUMNAS A y B - SALDOS (Solo si está habilitado)
        if (opciones.incluir_saldos) {
          fila[this.COLUMN_MAPPING.saldo_inicial] = this.formatearNumero(cuenta.saldo_inicial);
          fila[this.COLUMN_MAPPING.saldo_final] = this.formatearNumero(cuenta.saldo_final);
        }

        // COLUMNAS C-G - JERARQUÍA (se establece según el nivel de la cuenta)
        this.establecerJerarquiaExportacion(fila, cuenta);

        // COLUMNA H - I.D. (marca X si acepta movimientos)
        fila[this.COLUMN_MAPPING.id_movimiento] = cuenta.acepta_movimientos ? 'X' : '';

        // COLUMNA I - DESCRIPCION (CORREGIDO: usar descripcion en lugar de nombre)
        fila[this.COLUMN_MAPPING.descripcion] = cuenta.descripcion || '';

        // COLUMNA J - TC$/OM (Tipo OM)
        fila[this.COLUMN_MAPPING.tipo_om] = cuenta.tipo_om || '';

        // COLUMNA K - Centro de Costos
        fila[this.COLUMN_MAPPING.centro_costos] = cuenta.centro_costos || '';

        // COLUMNAS L y M - MOVIMIENTOS (Solo si está habilitado)
        if (opciones.incluir_movimientos) {
          fila[this.COLUMN_MAPPING.movimientos_debito] = this.formatearNumero(cuenta.movimientos_debito);
          fila[this.COLUMN_MAPPING.movimientos_credito] = this.formatearNumero(cuenta.movimientos_credito);
        }

        // COLUMNA N - Tipo/Cta (D para detalle, G para grupo)
        fila[this.COLUMN_MAPPING.tipo_cta] = cuenta.tipo_cta || (cuenta.acepta_movimientos ? 'D' : 'G');

        // COLUMNA O - NL (Nivel)
        fila[this.COLUMN_MAPPING.nivel] = cuenta.nivel?.toString() || '';

        // COLUMNAS P-S - CÓDIGOS ADICIONALES
        fila[this.COLUMN_MAPPING.codigo_at] = cuenta.codigo_at || '';
        fila[this.COLUMN_MAPPING.codigo_ct] = cuenta.codigo_ct || '';
        fila[this.COLUMN_MAPPING.codigo_cc] = cuenta.codigo_cc || '';
        fila[this.COLUMN_MAPPING.codigo_ti] = cuenta.codigo_ti || '';

        // COLUMNAS T-Y - DATOS FISCALES (Solo si está habilitado)
        if (opciones.incluir_fiscal) {
          fila[this.COLUMN_MAPPING.aplica_f350] = cuenta.aplica_f350 ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_f300] = cuenta.aplica_f300 ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_exogena] = cuenta.aplica_exogena ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_ica] = cuenta.aplica_ica ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_dr110] = cuenta.aplica_dr110 ? 'X' : '';
          fila[this.COLUMN_MAPPING.conciliacion_fiscal] = cuenta.conciliacion_fiscal || '';
        }

        // Las columnas Z y AA quedan vacías como en el template
        datos.push(fila);
      }

      // 5. Crear workbook con formato Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(datos, { 
        dateNF: 'yyyy-mm-dd',
        cellStyles: true
      });

      // 6. Aplicar formato similar al template
      this.aplicarFormatoWorksheet(worksheet, datos.length, cols);

      // 7. Agregar hoja principal
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PUC');

      // 8. Agregar hoja de resumen si se solicita
      if (opciones.incluir_resumen) {
        const resumen = this.generarDatosResumen(cuentas, opciones);
        const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
      }

      this.logger.log(`✅ Exportación completada: ${cuentas.length} cuentas exportadas`);

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    } catch (error) {
      this.logger.error(`❌ Error en exportación: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al exportar PUC: ${error.message}`);
    }
  }

  /**
   * Establece la jerarquía en las columnas C-G según el nivel de la cuenta
   */
  private establecerJerarquiaExportacion(fila: string[], cuenta: CuentaPuc): void {
    // Limpiar todas las columnas de jerarquía primero
    fila[this.COLUMN_MAPPING.codigo_clase] = '';
    fila[this.COLUMN_MAPPING.codigo_grupo] = '';
    fila[this.COLUMN_MAPPING.codigo_cuenta] = '';
    fila[this.COLUMN_MAPPING.codigo_subcuenta] = '';
    fila[this.COLUMN_MAPPING.codigo_detalle] = '';

    // Establecer el código en la columna correspondiente al nivel
    const codigo = cuenta.codigo_completo || '';
    
    switch (cuenta.nivel) {
      case 1: // Clase - Columna C
        fila[this.COLUMN_MAPPING.codigo_clase] = codigo;
        break;
      case 2: // Grupo - Columna D
        fila[this.COLUMN_MAPPING.codigo_grupo] = codigo;
        break;
      case 3: // Cuenta - Columna E
        fila[this.COLUMN_MAPPING.codigo_cuenta] = codigo;
        break;
      case 4: // Subcuenta - Columna F
        fila[this.COLUMN_MAPPING.codigo_subcuenta] = codigo;
        break;
      case 5: // Detalle - Columna G
        fila[this.COLUMN_MAPPING.codigo_detalle] = codigo;
        break;
      default:
        // Si no tiene nivel definido, intentar determinar por longitud del código
        this.establecerJerarquiaPorLongitud(fila, codigo);
    }
  }

  /**
   * Método auxiliar para establecer jerarquía basado en longitud del código
   */
  private establecerJerarquiaPorLongitud(fila: string[], codigo: string): void {
    if (!codigo) return;

    const longitud = codigo.length;
    
    if (longitud === 1) {
      fila[this.COLUMN_MAPPING.codigo_clase] = codigo;
    } else if (longitud === 2) {
      fila[this.COLUMN_MAPPING.codigo_grupo] = codigo;
    } else if (longitud === 4) {
      fila[this.COLUMN_MAPPING.codigo_cuenta] = codigo;
    } else if (longitud === 6) {
      fila[this.COLUMN_MAPPING.codigo_subcuenta] = codigo;
    } else if (longitud >= 8) {
      fila[this.COLUMN_MAPPING.codigo_detalle] = codigo;
    } else {
      // Por defecto, colocar en cuenta
      fila[this.COLUMN_MAPPING.codigo_cuenta] = codigo;
    }
  }

  /**
   * Formatear números para exportación (mantener consistencia con template)
   */
  private formatearNumero(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || valor === 0) {
      return '';
    }
    return valor.toString();
  }

  /**
   * Aplicar formato básico al worksheet
   */
  private aplicarFormatoWorksheet(worksheet: any, filas: number, columnas: number): void {
    // Configurar anchos de columna
    const anchos = [
      { wch: 12 }, // A - Saldo Inicial
      { wch: 12 }, // B - Saldo Final
      { wch: 6 },  // C - Clase
      { wch: 8 },  // D - Grupo
      { wch: 10 }, // E - Cuenta
      { wch: 12 }, // F - Subcuenta
      { wch: 14 }, // G - Detalle
      { wch: 8 },  // H - I.D.
      { wch: 40 }, // I - Descripción
      { wch: 10 }, // J - TC$/OM
      { wch: 15 }, // K - Centro Costos
      { wch: 12 }, // L - Débitos
      { wch: 12 }, // M - Créditos
      { wch: 8 },  // N - Tipo/Cta
      { wch: 6 },  // O - NL
      { wch: 8 },  // P - AT
      { wch: 8 },  // Q - CT
      { wch: 8 },  // R - CC
      { wch: 8 },  // S - TI
      { wch: 8 },  // T - F350
      { wch: 8 },  // U - F300
      { wch: 10 }, // V - Exógena
      { wch: 8 },  // W - ICA
      { wch: 10 }, // X - DR(110)
      { wch: 18 }, // Y - Conciliación Fiscal
      { wch: 8 },  // Z - Vacía
      { wch: 8 }   // AA - Vacía
    ];

    worksheet['!cols'] = anchos.slice(0, columnas);

    // Congelar primera fila (headers)
    if (filas > 1) {
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    }
  }

  /**
   * Validar opciones de exportación
   */
  private validarOpcionesExportacion(opciones: ExportPucExcelDto): void {
    // Validar que al menos una opción de contenido esté habilitada
    if (!opciones.incluir_saldos && !opciones.incluir_movimientos && !opciones.incluir_fiscal) {
      // Si no se especifica nada, habilitar saldos por defecto
      opciones.incluir_saldos = true;
    }

    // Validar filtro de clase
    if (opciones.filtro_clase && !/^[1-9]$/.test(opciones.filtro_clase)) {
      throw new BadRequestException('El filtro de clase debe ser un dígito del 1 al 9');
    }

    // Advertir sobre inconsistencias
    if (opciones.solo_movimientos && !opciones.incluir_movimientos) {
      this.logger.warn('⚠️ Inconsistencia: solo_movimientos=true pero incluir_movimientos=false');
    }
  }

  /**
   * Generar datos de resumen para hoja adicional
   */
  private generarDatosResumen(cuentas: CuentaPuc[], opciones: ExportPucExcelDto): string[][] {
    // Inicializar el array con tipo explícito
    const resumen: string[][] = [];
    
    // Título
    resumen.push(['RESUMEN DE EXPORTACION PUC']);
    resumen.push(['']);
    
    // Información general
    const fecha = new Date().toLocaleString('es-CO');
    resumen.push(['Fecha de exportacion:', fecha]);
    resumen.push(['Total de cuentas exportadas:', cuentas.length.toString()]);
    resumen.push(['']);

    // Distribución por nivel
    resumen.push(['DISTRIBUCION POR NIVEL:']);
    const porNivel = this.agruparPorNivel(cuentas);
    Object.entries(porNivel).forEach(([nivel, cantidad]) => {
      const nombreNivel = this.obtenerNombreNivel(parseInt(nivel));
      resumen.push([`Nivel ${nivel} (${nombreNivel}):`, cantidad.toString()]);
    });
    resumen.push(['']);

    // Distribución por estado
    resumen.push(['DISTRIBUCION POR ESTADO:']);
    const porEstado = this.agruparPorEstado(cuentas);
    Object.entries(porEstado).forEach(([estado, cantidad]) => {
      resumen.push([`${estado}:`, cantidad.toString()]);
    });
    resumen.push(['']);

    // Totales si se incluyeron saldos
    if (opciones.incluir_saldos) {
      resumen.push(['TOTALES:']);
      const totales = this.calcularTotales(cuentas);
      resumen.push(['Total Saldo Inicial:', totales.saldoInicial.toLocaleString('es-CO')]);
      resumen.push(['Total Saldo Final:', totales.saldoFinal.toLocaleString('es-CO')]);
      resumen.push(['']);
    }

    // Opciones aplicadas
    resumen.push(['OPCIONES DE EXPORTACION:']);
    resumen.push(['Incluir saldos:', opciones.incluir_saldos ? 'SI' : 'NO']);
    resumen.push(['Incluir movimientos:', opciones.incluir_movimientos ? 'SI' : 'NO']);
    resumen.push(['Incluir informacion fiscal:', opciones.incluir_fiscal ? 'SI' : 'NO']);
    resumen.push(['Solo con movimientos:', opciones.solo_movimientos ? 'SI' : 'NO']);
    resumen.push(['Incluir inactivas:', opciones.incluir_inactivas ? 'SI' : 'NO']);

    if (opciones.filtro_estado) {
      resumen.push(['Filtro estado:', opciones.filtro_estado]);
    }
    if (opciones.filtro_tipo) {
      resumen.push(['Filtro tipo:', opciones.filtro_tipo]);
    }
    if (opciones.filtro_clase) {
      resumen.push(['Filtro clase:', opciones.filtro_clase]);
    }

    return resumen;
  }

  /**
   * Métodos auxiliares para resumen con tipos explícitos
   */
  private agruparPorNivel(cuentas: CuentaPuc[]): Record<string, number> {
    const agrupado: Record<string, number> = {};
    
    cuentas.forEach(cuenta => {
      const nivel = cuenta.nivel?.toString() || '0';
      agrupado[nivel] = (agrupado[nivel] || 0) + 1;
    });
    
    return agrupado;
  }

  private agruparPorEstado(cuentas: CuentaPuc[]): Record<string, number> {
    const agrupado: Record<string, number> = {};
    
    cuentas.forEach(cuenta => {
      const estado = cuenta.estado || 'DESCONOCIDO';
      agrupado[estado] = (agrupado[estado] || 0) + 1;
    });
    
    return agrupado;
  }

  private calcularTotales(cuentas: CuentaPuc[]): { saldoInicial: number; saldoFinal: number } {
    let saldoInicial = 0;
    let saldoFinal = 0;
    
    cuentas.forEach(cuenta => {
      saldoInicial += cuenta.saldo_inicial || 0;
      saldoFinal += cuenta.saldo_final || 0;
    });
    
    return { saldoInicial, saldoFinal };
  }

  private obtenerNombreNivel(nivel: number): string {
    const nombres: Record<number, string> = {
      1: 'Clase',
      2: 'Grupo', 
      3: 'Cuenta',
      4: 'Subcuenta',
      5: 'Detalle'
    };
    return nombres[nivel] || 'Desconocido';
  }

  // ===============================================
  // 📋 TEMPLATES Y PLANTILLAS
  // ===============================================

  async generarTemplate(conEjemplos: boolean = true): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de instrucciones
    const instrucciones = this.generarDatosInstrucciones();
    const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
    XLSX.utils.book_append_sheet(workbook, wsInstrucciones, 'Instrucciones');
    
    // Crear hoja PUC con template
    const datosPUC = this.generarDatosTemplate(conEjemplos);
    const wsPUC = XLSX.utils.aoa_to_sheet(datosPUC);
    XLSX.utils.book_append_sheet(workbook, wsPUC, 'PUC');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Método requerido por el servicio principal
  async generarTemplateExcel(conEjemplos: boolean = true): Promise<Buffer> {
    return this.generarTemplate(conEjemplos);
  }

  /**
   * Genera los datos del template de Excel basado en la estructura exacta del archivo proporcionado
   * @param conEjemplos - Si incluir filas de ejemplo
   * @returns Array de arrays con los datos del template
   */
  private generarDatosTemplate(conEjemplos: boolean): string[][] {
    // FILA 1 - Headers principales (exactamente como en el archivo)
    const headers1 = [
      '', // Col A - vacía
      '', // Col B - vacía  
      'CLASE', // Col C
      'GRUPO', // Col D
      'CUENTA', // Col E
      'SUBCUENTA', // Col F
      'DETALLE', // Col G
      'I. D.', // Col H
      'DESCRIPCION', // Col I
      'TC$', // Col J
      'Centro de Costos', // Col K
      'Movimientos', // Col L
      '', // Col M - vacía
      'Tipo', // Col N
      '', // Col O - vacía
      '', // Col P - vacía
      '', // Col Q - vacía
      '', // Col R - vacía
      '', // Col S - vacía
      'Informacion Fiscal', // Col T
      '', // Col U - vacía
      '', // Col V - vacía
      '', // Col W - vacía
      '', // Col X - vacía
      'UVT $49,799', // Col Y
      '', // Col Z - vacía
      '' // Col AA - vacía
    ];

    // FILA 2 - Headers secundarios (exactamente como en el archivo)
    const headers2 = [
      'SALDO INICIAL', // Col A
      'SALDO FINAL', // Col B
      'C (1)', // Col C
      'CGG (2)', // Col D
      'CGUU(3)', // Col E
      'CGUUSS(4)', // Col F
      'CGGUUSSDD(5)', // Col G
      '', // Col H - vacía (corresponde a I.D.)
      '', // Col I - vacía (corresponde a DESCRIPCION)
      'OM', // Col J
      '', // Col K - vacía
      'Debitos', // Col L
      'Creditos', // Col M
      'Cta', // Col N
      'NL', // Col O
      'AT', // Col P
      'CT', // Col Q
      'CC', // Col R
      'TI', // Col S
      'F350', // Col T
      'F300', // Col U
      'Exogena', // Col V
      'ICA', // Col W
      'DR(110)', // Col X
      'Conciliacion Fiscal', // Col Y
      '', // Col Z - vacía
      '' // Col AA - vacía
    ];

    const datos = [headers1, headers2];

    // Si se solicitan ejemplos, agregar las filas de ejemplo del archivo original
    if (conEjemplos) {
      const ejemplos = [
        // Fila 3 - ACTIVOS (Clase 1)
        [
          '21864301859.74', // SALDO INICIAL
          '', // SALDO FINAL
          '1', // C (1) - Clase
          '', // CGG (2) - Grupo  
          '', // CGUU(3) - Cuenta
          '', // CGUUSS(4) - Subcuenta
          '', // CGGUUSSDD(5) - Detalle
          '', // I.D. - vacío
          'ACTIVOS', // DESCRIPCION
          '', // OM - vacío
          '', // Centro de Costos - vacío
          '', // Debitos - vacío
          '', // Creditos - vacío
          'G', // Cta - Tipo cuenta (G=Grupo)
          '1', // NL - Nivel
          '', // AT - vacío
          '', // CT - vacío
          '', // CC - vacío
          '', // TI - vacío
          '', // F350 - vacío
          '', // F300 - vacío
          '', // Exogena - vacío
          '', // ICA - vacío
          '', // DR(110) - vacío
          '', // Conciliacion Fiscal - vacío
          '', // Col Z - vacía
          '' // Col AA - vacía
        ],
        // Fila 4 - EFECTIVO Y EQUIVALENTES AL EFECTIVO (Grupo 11)
        [
          '1912615578.68', // SALDO INICIAL
          '', // SALDO FINAL
          '', // C (1) - vacío
          '11', // CGG (2) - Grupo
          '', // CGUU(3) - vacío
          '', // CGUUSS(4) - vacío
          '', // CGGUUSSDD(5) - vacío
          '', // I.D. - vacío
          'EFECTIVO Y EQUIVALENTES AL EFECTIVO', // DESCRIPCION
          '', // OM - vacío
          '', // Centro de Costos - vacío
          '', // Debitos - vacío
          '', // Creditos - vacío
          'G', // Cta - Tipo cuenta (G=Grupo)
          '2', // NL - Nivel
          '', // AT - vacío
          '', // CT - vacío
          '', // CC - vacío
          '', // TI - vacío
          '', // F350 - vacío
          '', // F300 - vacío
          '', // Exogena - vacío
          '', // ICA - vacío
          '', // DR(110) - vacío
          '', // Conciliacion Fiscal - vacío
          '', // Col Z - vacía
          '' // Col AA - vacía
        ]
      ];
      
      datos.push(...ejemplos);
    }

    return datos;
  }

  private generarDatosInstrucciones(): string[][] {
    return [
      ['📋 INSTRUCCIONES PARA IMPORTAR PUC - TEMPLATE ACTUALIZADO'],
      [''],
      ['🔍 ESTRUCTURA DEL ARCHIVO:'],
      ['• La hoja debe llamarse "PUC" (puede cambiar el nombre en las opciones)'],
      ['• Las primeras 2 filas contienen los headers/columnas'],
      ['• Los datos deben comenzar desde la fila 3'],
      ['• Estructura basada en plantilla estándar colombiana'],
      [''],
      ['📊 COLUMNAS PRINCIPALES (Jerarquía):'],
      ['• CLASE (Col C): Código de clase (1 dígito) - Ej: 1, 2, 3, 4, 5, 6'],
      ['• GRUPO (Col D): Código de grupo (2 dígitos) - Ej: 11, 12, 21, 22'],
      ['• CUENTA (Col E): Código de cuenta (4 dígitos) - Ej: 1105, 1110, 2105'],
      ['• SUBCUENTA (Col F): Código de subcuenta (6 dígitos) - Ej: 110501, 110502'],
      ['• DETALLE (Col G): Código de detalle (8+ dígitos) - Ej: 11050101, 11050102'],
      ['• DESCRIPCION (Col I): Descripción de la cuenta (obligatorio)'],
      [''],
      ['📊 COLUMNAS DE IDENTIFICACIÓN:'],
      ['• I.D. (Col H): Marcar con "X" si acepta movimientos'],
      ['• TC$/OM (Col J): Tasa de cambio/Operación múltiple'],
      ['• Centro de Costos (Col K): Código del centro de costos'],
      ['• Cta (Col N): Tipo de cuenta (G=Grupo, D=Detalle)'],
      ['• NL (Col O): Nivel jerárquico (se calcula automáticamente)'],
      [''],
      ['📊 COLUMNAS DE SALDOS Y MOVIMIENTOS:'],
      ['• SALDO INICIAL (Col A): Saldo inicial de la cuenta'],
      ['• SALDO FINAL (Col B): Saldo final de la cuenta'],
      ['• Debitos (Col L): Total movimientos débito'],
      ['• Creditos (Col M): Total movimientos crédito'],
      [''],
      ['📊 COLUMNAS DE CONTROL (RECURSOS CTA):'],
      ['• AT (Col P): Afecta Terceros - Requiere información de terceros'],
      ['• CT (Col Q): Cierra saldos de terceros al ciclo anual'],
      ['• CC (Col R): Cuenta de cierre contable'],
      ['• TI (Col S): Tipo de Interfase - Afectación en módulo específico'],
      [''],
      ['📊 COLUMNAS FISCALES (Información Fiscal):'],
      ['• F350 (Col T): Aplica formulario F350 (Retención en la fuente)'],
      ['• F300 (Col U): Aplica formulario F300'],
      ['• Exogena (Col V): Aplica información exógena'],
      ['• ICA (Col W): Aplica ICA (Impuesto de Industria y Comercio)'],
      ['• DR(110) (Col X): Aplica DR110'],
      ['• Conciliacion Fiscal (Col Y): Información de conciliación fiscal'],
      ['• UVT $49,799 (Col Y): Referencia UVT vigente'],
      [''],
      ['🏗️ JERARQUÍA DE CÓDIGOS:'],
      ['• Clase: 1 dígito (Ej: 1=ACTIVOS, 2=PASIVOS, 3=PATRIMONIO, 4=INGRESOS, 5=GASTOS, 6=COSTOS)'],
      ['• Grupo: 2 dígitos (Ej: 11=EFECTIVO, 12=INVERSIONES)'],
      ['• Cuenta: 4 dígitos (Ej: 1105=CAJA, 1110=BANCOS)'],
      ['• Subcuenta: 6 dígitos (Ej: 110501=Caja principal, 110502=Caja menor)'],
      ['• Detalle: 8+ dígitos (Ej: 11050101=Caja principal sede A)'],
      [''],
      ['⚠️ VALIDACIONES IMPORTANTES:'],
      ['• Los códigos deben contener solo números'],
      ['• Respetar jerarquía: crear padres antes que hijos'],
      ['• Solo llenar UNA columna de código por fila (según nivel)'],
      ['• Las descripciones son obligatorias'],
      ['• I.D. = "X" indica que acepta movimientos'],
      [''],
      ['🔄 NATURALEZA AUTOMÁTICA:'],
      ['• DEBITO: Clases 1, 5, 6, 7, 8 (Activos, Gastos, Costos)'],
      ['• CREDITO: Clases 2, 3, 4, 9 (Pasivos, Patrimonio, Ingresos)']
    ];
  }

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES PARA IMPORTACIÓN CORREGIDOS
  // ===============================================

  private async procesarFilasExcel(
    file: MulterFile, // ✅ CORREGIDO
    opciones: ImportPucExcelDto
  ): Promise<FilaProcesada[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets['PUC'];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    
    const filasValidas: FilaProcesada[] = [];
    
    // Procesar desde la fila 3 (índice 2) - saltando headers
    for (let fila = 2; fila <= range.e.r; fila++) {
      const filaData = this.extraerFilaExcel(worksheet, fila, range.e.c);
      
      // Saltar filas vacías o de separación
      if (this.esFilaVacia(filaData) || this.esFilaSeparadora(filaData)) {
        continue;
      }

      const filaProcesada = this.procesarFilaIndividual(filaData, fila + 1);
      if (filaProcesada) {
        filasValidas.push(filaProcesada);
      }
    }

    return filasValidas;
  }

  private extraerFilaExcel(worksheet: XLSX.WorkSheet, fila: number, maxCol: number): any[] {
    const filaData: any[] = [];
    for (let col = 0; col <= maxCol; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: fila, c: col });
      const cell = worksheet[cellAddress];
      filaData.push(cell ? (cell.v ?? '') : '');
    }
    return filaData;
  }

  private esFilaVacia(filaData: any[]): boolean {
    return filaData.every(cell => !cell || cell.toString().trim() === '');
  }

  private esFilaSeparadora(filaData: any[]): boolean {
    // CORREGIDO: usar descripcion en lugar de nombre
    const descripcion = filaData[this.COLUMN_MAPPING.descripcion];
    return descripcion && descripcion.toString().trim() === 'N / A';
  }

  private procesarFilaIndividual(filaData: any[], numeroFila: number): FilaProcesada | null {
    try {
      // Extraer código y nivel
      const { codigo, nivel } = this.determinarCodigoYNivel(filaData);
      if (!codigo) {
        this.logger.warn(`Fila ${numeroFila}: No se encontró código válido`);
        return null;
      }

      // CORREGIDO: Extraer descripcion en lugar de nombre
      const descripcion = this.limpiarTexto(filaData[this.COLUMN_MAPPING.descripcion]);
      if (!descripcion) {
        this.logger.warn(`Fila ${numeroFila}: Descripción requerida`);
        return null;
      }

      // Determinar naturaleza basada en clase
      const clase = codigo.charAt(0);
      const naturaleza = ['1', '5', '6', '7', '8'].includes(clase) ? 
        NaturalezaCuentaEnum.DEBITO : NaturalezaCuentaEnum.CREDITO;

      // Determinar si acepta movimientos
      const idMovimiento = filaData[this.COLUMN_MAPPING.id_movimiento];
      const aceptaMovimientos = this.convertirBooleano(idMovimiento);

      // Determinar tipo de cuenta
      const tipoCta = filaData[this.COLUMN_MAPPING.tipo_cta];
      const tipoCuenta = (tipoCta === 'D' || aceptaMovimientos) ? 
        TipoCuentaEnum.DETALLE : this.determinarTipoCuentaEnum(nivel);

      // Determinar código padre
      const codigoPadre = this.determinarCodigoPadre(codigo, nivel);

      return {
        codigo_completo: codigo,
        descripcion, // CORREGIDO: usar descripcion
        codigo_clase: nivel === 1 ? codigo : null,
        codigo_grupo: nivel === 2 ? codigo : null,
        codigo_cuenta: nivel === 3 ? codigo : null,
        codigo_subcuenta: nivel === 4 ? codigo : null,
        codigo_detalle: nivel === 5 ? codigo : null,
        nivel,
        tipo_cta: tipoCta || (aceptaMovimientos ? 'D' : 'G'),
        naturaleza,
        tipo_cuenta: tipoCuenta,
        codigo_padre: codigoPadre,
        acepta_movimientos: aceptaMovimientos,
        saldo_inicial: this.convertirNumero(filaData[this.COLUMN_MAPPING.saldo_inicial]),
        saldo_final: this.convertirNumero(filaData[this.COLUMN_MAPPING.saldo_final]),
        movimientos_debito: this.convertirNumero(filaData[this.COLUMN_MAPPING.movimientos_debito]),
        movimientos_credito: this.convertirNumero(filaData[this.COLUMN_MAPPING.movimientos_credito]),
        centro_costos: this.limpiarTexto(filaData[this.COLUMN_MAPPING.centro_costos]),
        id_movimiento: this.limpiarTexto(filaData[this.COLUMN_MAPPING.id_movimiento]),
        tipo_om: this.limpiarTexto(filaData[this.COLUMN_MAPPING.tipo_om]),
        codigo_at: this.limpiarTexto(filaData[this.COLUMN_MAPPING.codigo_at]),
        codigo_ct: this.limpiarTexto(filaData[this.COLUMN_MAPPING.codigo_ct]),
        codigo_cc: this.limpiarTexto(filaData[this.COLUMN_MAPPING.codigo_cc]),
        codigo_ti: this.limpiarTexto(filaData[this.COLUMN_MAPPING.codigo_ti]),
        aplica_f350: this.convertirBooleano(filaData[this.COLUMN_MAPPING.aplica_f350]),
        aplica_f300: this.convertirBooleano(filaData[this.COLUMN_MAPPING.aplica_f300]),
        aplica_exogena: this.convertirBooleano(filaData[this.COLUMN_MAPPING.aplica_exogena]),
        aplica_ica: this.convertirBooleano(filaData[this.COLUMN_MAPPING.aplica_ica]),
        aplica_dr110: this.convertirBooleano(filaData[this.COLUMN_MAPPING.aplica_dr110]),
        conciliacion_fiscal: this.limpiarTexto(filaData[this.COLUMN_MAPPING.conciliacion_fiscal]),
        fila_excel: numeroFila
      };

    } catch (error) {
      this.logger.error(`Error procesando fila ${numeroFila}: ${error.message}`);
      return null;
    }
  }

  private determinarCodigoYNivel(filaData: any[]): { codigo: string; nivel: number } {
    // Buscar en las columnas de jerarquía
    const clase = this.limpiarCodigo(filaData[this.COLUMN_MAPPING.codigo_clase]);
    if (clase) return { codigo: clase, nivel: 1 };

    const grupo = this.limpiarCodigo(filaData[this.COLUMN_MAPPING.codigo_grupo]);
    if (grupo) return { codigo: grupo, nivel: 2 };

    const cuenta = this.limpiarCodigo(filaData[this.COLUMN_MAPPING.codigo_cuenta]);
    if (cuenta) return { codigo: cuenta, nivel: 3 };

    const subcuenta = this.limpiarCodigo(filaData[this.COLUMN_MAPPING.codigo_subcuenta]);
    if (subcuenta) return { codigo: subcuenta, nivel: 4 };

    const detalle = this.limpiarCodigo(filaData[this.COLUMN_MAPPING.codigo_detalle]);
    if (detalle) return { codigo: detalle, nivel: 5 };

    return { codigo: '', nivel: 0 };
  }

  private determinarCodigoPadre(codigo: string, nivel: number): string | null {
    if (nivel <= 1) return null;

    switch (nivel) {
      case 2: // Grupo -> padre es Clase
        return codigo.substring(0, 1);
      case 3: // Cuenta -> padre es Grupo
        return codigo.substring(0, 2);
      case 4: // Subcuenta -> padre es Cuenta
        return codigo.substring(0, 4);
      case 5: // Detalle -> padre es Subcuenta
        return codigo.substring(0, 6);
      default:
        return null;
    }
  }

  private determinarTipoCuentaEnum(nivel: number): TipoCuentaEnum {
    switch (nivel) {
      case 1: return TipoCuentaEnum.CLASE;
      case 2: return TipoCuentaEnum.GRUPO;
      case 3: return TipoCuentaEnum.CUENTA;
      case 4: return TipoCuentaEnum.SUBCUENTA;
      case 5: return TipoCuentaEnum.DETALLE;
      default: return TipoCuentaEnum.DETALLE;
    }
  }

  private async crearActualizarCuentas(
    filasValidas: FilaProcesada[], 
    opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    const resultado: ResultadoImportacion = {
      errores: [],
      advertencias: [],
      exito: false,
      mensaje: '',
      resumen: {
        total_procesadas: 0,
        insertadas: 0,
        actualizadas: 0,
        errores: 0,
        omitidas: 0
      },
      cuentas_procesadas: undefined
    };

    // Ordenar por nivel y código para procesar jerarquía correctamente
    filasValidas.sort((a, b) => {
      if (a.nivel !== b.nivel) return a.nivel - b.nivel;
      return a.codigo_completo.localeCompare(b.codigo_completo);
    });

    let insertadas = 0;
    let actualizadas = 0;
    let omitidas = 0;

    for (const fila of filasValidas) {
      try {
        const cuentaExistente = await this.cuentaPucRepository.findOne({
          where: { codigo_completo: fila.codigo_completo }
        });

        if (cuentaExistente) {
          // Actualizar cuenta existente
          if (opciones.sobreescribir) {
            await this.actualizarCuentaExistente(cuentaExistente, fila, opciones);
            actualizadas++;
          } else {
            resultado.advertencias.push(`Cuenta ${fila.codigo_completo} ya existe (no se actualizó)`);
            omitidas++;
          }
        } else {
          // Crear nueva cuenta
          await this.crearNuevaCuenta(fila, opciones);
          insertadas++;
        }

      } catch (error) {
        resultado.errores.push({
          fila: fila.fila_excel,
          error: error.message,
        });
        this.logger.error(`Error en fila ${fila.fila_excel}: ${error.message}`);
      }
    }

    resultado.exito = resultado.errores.length === 0;
    resultado.mensaje = resultado.exito ? 'Importación completada exitosamente' : 'Importación completada con errores';
    resultado.resumen = {
      total_procesadas: filasValidas.length,
      insertadas,
      actualizadas,
      errores: resultado.errores.length,
      omitidas: filasValidas.length - insertadas - actualizadas - resultado.errores.length,
    };

    return resultado;
  }

  private async actualizarCuentaExistente(
    cuenta: CuentaPuc, 
    fila: FilaProcesada, 
    opciones: ImportPucExcelDto
  ): Promise<void> {
    // CORREGIDO: Actualizar descripcion en lugar de nombre
    cuenta.descripcion = fila.descripcion;
    cuenta.acepta_movimientos = fila.acepta_movimientos;
    cuenta.tipo_cuenta = fila.tipo_cuenta;

    // Actualizar saldos si está habilitado
    if (opciones.importar_saldos) {
      cuenta.saldo_inicial = fila.saldo_inicial;
      cuenta.saldo_final = fila.saldo_final;
      cuenta.movimientos_debito = fila.movimientos_debito;
      cuenta.movimientos_credito = fila.movimientos_credito;
    }

    // Actualizar campos adicionales
    cuenta.centro_costos = fila.centro_costos;
    cuenta.tipo_om = fila.tipo_om;
    cuenta.codigo_at = fila.codigo_at;
    cuenta.codigo_ct = fila.codigo_ct;
    cuenta.codigo_cc = fila.codigo_cc;
    cuenta.codigo_ti = fila.codigo_ti;

    // Actualizar información fiscal si está habilitado
    if (opciones.importar_fiscal) {
      cuenta.aplica_f350 = fila.aplica_f350;
      cuenta.aplica_f300 = fila.aplica_f300;
      cuenta.aplica_exogena = fila.aplica_exogena;
      cuenta.aplica_ica = fila.aplica_ica;
      cuenta.aplica_dr110 = fila.aplica_dr110;
      cuenta.conciliacion_fiscal = fila.conciliacion_fiscal;
    }

    await this.cuentaPucRepository.save(cuenta);
  }

  private async crearNuevaCuenta(
    fila: FilaProcesada, 
    opciones: ImportPucExcelDto
  ): Promise<void> {
    const nuevaCuenta = new CuentaPuc();

    // CORREGIDO: Campos obligatorios usando descripcion
    nuevaCuenta.codigo_completo = fila.codigo_completo;
    nuevaCuenta.descripcion = fila.descripcion; // CAMBIADO DE nombre A descripcion
    nuevaCuenta.naturaleza = fila.naturaleza;
    nuevaCuenta.tipo_cuenta = fila.tipo_cuenta;
    nuevaCuenta.nivel = fila.nivel;
    nuevaCuenta.acepta_movimientos = fila.acepta_movimientos;
    nuevaCuenta.codigo_padre = fila.codigo_padre;
    nuevaCuenta.estado = EstadoCuentaEnum.ACTIVA;

    // Códigos de jerarquía
    nuevaCuenta.codigo_clase = fila.codigo_clase;
    nuevaCuenta.codigo_grupo = fila.codigo_grupo;
    nuevaCuenta.codigo_cuenta = fila.codigo_cuenta;
    nuevaCuenta.codigo_subcuenta = fila.codigo_subcuenta;
    nuevaCuenta.codigo_detalle = fila.codigo_detalle;

    // Saldos si está habilitado
    if (opciones.importar_saldos) {
      nuevaCuenta.saldo_inicial = fila.saldo_inicial;
      nuevaCuenta.saldo_final = fila.saldo_final;
      nuevaCuenta.movimientos_debito = fila.movimientos_debito;
      nuevaCuenta.movimientos_credito = fila.movimientos_credito;
    }

    // Campos adicionales
    nuevaCuenta.centro_costos = fila.centro_costos;
    nuevaCuenta.tipo_om = fila.tipo_om;
    nuevaCuenta.codigo_at = fila.codigo_at;
    nuevaCuenta.codigo_ct = fila.codigo_ct;
    nuevaCuenta.codigo_cc = fila.codigo_cc;
    nuevaCuenta.codigo_ti = fila.codigo_ti;

    // Información fiscal si está habilitado
    if (opciones.importar_fiscal) {
      nuevaCuenta.aplica_f350 = fila.aplica_f350;
      nuevaCuenta.aplica_f300 = fila.aplica_f300;
      nuevaCuenta.aplica_exogena = fila.aplica_exogena;
      nuevaCuenta.aplica_ica = fila.aplica_ica;
      nuevaCuenta.aplica_dr110 = fila.aplica_dr110;
      nuevaCuenta.conciliacion_fiscal = fila.conciliacion_fiscal;
    }

    await this.cuentaPucRepository.save(nuevaCuenta);
  }

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES DE EXPORTACIÓN
  // ===============================================

  /**
   * Establece la jerarquía en las columnas C-G según el nivel de la cuenta
   */
  private establecerJerarquiaExportacion(fila: string[], cuenta: CuentaPuc): void {
    // Limpiar todas las columnas de jerarquía primero
    fila[this.COLUMN_MAPPING.codigo_clase] = '';
    fila[this.COLUMN_MAPPING.codigo_grupo] = '';
    fila[this.COLUMN_MAPPING.codigo_cuenta] = '';
    fila[this.COLUMN_MAPPING.codigo_subcuenta] = '';
    fila[this.COLUMN_MAPPING.codigo_detalle] = '';

    // Establecer el código en la columna correspondiente al nivel
    const codigo = cuenta.codigo_completo || '';
    
    switch (cuenta.nivel) {
      case 1: // Clase - Columna C
        fila[this.COLUMN_MAPPING.codigo_clase] = codigo;
        break;
      case 2: // Grupo - Columna D
        fila[this.COLUMN_MAPPING.codigo_grupo] = codigo;
        break;
      case 3: // Cuenta - Columna E
        fila[this.COLUMN_MAPPING.codigo_cuenta] = codigo;
        break;
      case 4: // Subcuenta - Columna F
        fila[this.COLUMN_MAPPING.codigo_subcuenta] = codigo;
        break;
      case 5: // Detalle - Columna G
        fila[this.COLUMN_MAPPING.codigo_detalle] = codigo;
        break;
      default:
        // Si no tiene nivel definido, intentar determinar por longitud del código
        this.establecerJerarquiaPorLongitud(fila, codigo);
    }
  }

  /**
   * Método auxiliar para establecer jerarquía basado en longitud del código
   */
  private establecerJerarquiaPorLongitud(fila: string[], codigo: string): void {
    if (!codigo) return;

    const longitud = codigo.length;
    
    if (longitud === 1) {
      fila[this.COLUMN_MAPPING.codigo_clase] = codigo;
    } else if (longitud === 2) {
      fila[this.COLUMN_MAPPING.codigo_grupo] = codigo;
    } else if (longitud === 4) {
      fila[this.COLUMN_MAPPING.codigo_cuenta] = codigo;
    } else if (longitud === 6) {
      fila[this.COLUMN_MAPPING.codigo_subcuenta] = codigo;
    } else if (longitud >= 8) {
      fila[this.COLUMN_MAPPING.codigo_detalle] = codigo;
    } else {
      // Por defecto, colocar en cuenta
      fila[this.COLUMN_MAPPING.codigo_cuenta] = codigo;
    }
  }

  /**
   * Formatear números para exportación (mantener consistencia con template)
   */
  private formatearNumero(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || valor === 0) {
      return '';
    }
    return valor.toString();
  }

  /**
   * Aplicar formato básico al worksheet
   */
  private aplicarFormatoWorksheet(worksheet: any, filas: number, columnas: number): void {
    // Configurar anchos de columna
    const anchos = [
      { wch: 12 }, // A - Saldo Inicial
      { wch: 12 }, // B - Saldo Final
      { wch: 6 },  // C - Clase
      { wch: 8 },  // D - Grupo
      { wch: 10 }, // E - Cuenta
      { wch: 12 }, // F - Subcuenta
      { wch: 14 }, // G - Detalle
      { wch: 8 },  // H - I.D.
      { wch: 40 }, // I - Descripción
      { wch: 10 }, // J - TC$/OM
      { wch: 15 }, // K - Centro Costos
      { wch: 12 }, // L - Débitos
      { wch: 12 }, // M - Créditos
      { wch: 8 },  // N - Tipo/Cta
      { wch: 6 },  // O - NL
      { wch: 8 },  // P - AT
      { wch: 8 },  // Q - CT
      { wch: 8 },  // R - CC
      { wch: 8 },  // S - TI
      { wch: 8 },  // T - F350
      { wch: 8 },  // U - F300
      { wch: 10 }, // V - Exógena
      { wch: 8 },  // W - ICA
      { wch: 10 }, // X - DR(110)
      { wch: 18 }, // Y - Conciliación Fiscal
      { wch: 8 },  // Z - Vacía
      { wch: 8 }   // AA - Vacía
    ];

    worksheet['!cols'] = anchos.slice(0, columnas);

    // Congelar primera fila (headers)
    if (filas > 1) {
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    }
  }

  /**
   * Validar opciones de exportación
   */
  private validarOpcionesExportacion(opciones: ExportPucExcelDto): void {
    // Validar que al menos una opción de contenido esté habilitada
    if (!opciones.incluir_saldos && !opciones.incluir_movimientos && !opciones.incluir_fiscal) {
      // Si no se especifica nada, habilitar saldos por defecto
      opciones.incluir_saldos = true;
    }

    // Validar filtro de clase
    if (opciones.filtro_clase && !/^[1-9]$/.test(opciones.filtro_clase)) {
      throw new BadRequestException('El filtro de clase debe ser un dígito del 1 al 9');
    }

    // Advertir sobre inconsistencias
    if (opciones.solo_movimientos && !opciones.incluir_movimientos) {
      this.logger.warn('⚠️ Inconsistencia: solo_movimientos=true pero incluir_movimientos=false');
    }
  }

  /**
   * Generar datos de resumen para hoja adicional
   */
  private generarDatosResumen(cuentas: CuentaPuc[], opciones: ExportPucExcelDto): string[][] {
    const resumen: string[][] = [];
    
    // Título
    resumen.push(['RESUMEN DE EXPORTACION PUC']);
    resumen.push(['']);
    
    // Información general
    const fecha = new Date().toLocaleString('es-CO');
    resumen.push(['Fecha de exportacion:', fecha]);
    resumen.push(['Total de cuentas exportadas:', cuentas.length.toString()]);
    resumen.push(['']);

    // Distribución por nivel
    resumen.push(['DISTRIBUCION POR NIVEL:']);
    const porNivel = this.agruparPorNivel(cuentas);
    Object.entries(porNivel).forEach(([nivel, cantidad]) => {
      const nombreNivel = this.obtenerNombreNivel(parseInt(nivel));
      resumen.push([`Nivel ${nivel} (${nombreNivel}):`, cantidad.toString()]);
    });
    resumen.push(['']);

    // Distribución por estado
    resumen.push(['DISTRIBUCION POR ESTADO:']);
    const porEstado = this.agruparPorEstado(cuentas);
    Object.entries(porEstado).forEach(([estado, cantidad]) => {
      resumen.push([`${estado}:`, cantidad.toString()]);
    });
    resumen.push(['']);

    // Totales si se incluyeron saldos
    if (opciones.incluir_saldos) {
      resumen.push(['TOTALES:']);
      const totales = this.calcularTotales(cuentas);
      resumen.push(['Total Saldo Inicial:', totales.saldoInicial.toLocaleString('es-CO')]);
      resumen.push(['Total Saldo Final:', totales.saldoFinal.toLocaleString('es-CO')]);
      resumen.push(['']);
    }

    // Opciones aplicadas
    resumen.push(['OPCIONES DE EXPORTACION:']);
    resumen.push(['Incluir saldos:', opciones.incluir_saldos ? 'SI' : 'NO']);
    resumen.push(['Incluir movimientos:', opciones.incluir_movimientos ? 'SI' : 'NO']);
    resumen.push(['Incluir informacion fiscal:', opciones.incluir_fiscal ? 'SI' : 'NO']);
    resumen.push(['Solo con movimientos:', opciones.solo_movimientos ? 'SI' : 'NO']);
    resumen.push(['Incluir inactivas:', opciones.incluir_inactivas ? 'SI' : 'NO']);

    if (opciones.filtro_estado) {
      resumen.push(['Filtro estado:', opciones.filtro_estado]);
    }
    if (opciones.filtro_tipo) {
      resumen.push(['Filtro tipo:', opciones.filtro_tipo]);
    }
    if (opciones.filtro_clase) {
      resumen.push(['Filtro clase:', opciones.filtro_clase]);
    }

    return resumen;
  }

  /**
   * Métodos auxiliares para resumen con tipos explícitos
   */
  private agruparPorNivel(cuentas: CuentaPuc[]): Record<string, number> {
    const agrupado: Record<string, number> = {};
    
    cuentas.forEach(cuenta => {
      const nivel = cuenta.nivel?.toString() || '0';
      agrupado[nivel] = (agrupado[nivel] || 0) + 1;
    });
    
    return agrupado;
  }

  private agruparPorEstado(cuentas: CuentaPuc[]): Record<string, number> {
    const agrupado: Record<string, number> = {};
    
    cuentas.forEach(cuenta => {
      const estado = cuenta.estado || 'DESCONOCIDO';
      agrupado[estado] = (agrupado[estado] || 0) + 1;
    });
    
    return agrupado;
  }

  private calcularTotales(cuentas: CuentaPuc[]): { saldoInicial: number; saldoFinal: number } {
    let saldoInicial = 0;
    let saldoFinal = 0;
    
    cuentas.forEach(cuenta => {
      saldoInicial += cuenta.saldo_inicial || 0;
      saldoFinal += cuenta.saldo_final || 0;
    });
    
    return { saldoInicial, saldoFinal };
  }

  private obtenerNombreNivel(nivel: number): string {
    const nombres: Record<number, string> = {
      1: 'Clase',
      2: 'Grupo', 
      3: 'Cuenta',
      4: 'Subcuenta',
      5: 'Detalle'
    };
    return nombres[nivel] || 'Desconocido';
  }

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES DE TEMPLATE
  // ===============================================

  /**
   * Genera los datos del template de Excel basado en la estructura exacta del archivo proporcionado
   */
  private generarDatosTemplate(conEjemplos: boolean): string[][] {
    // FILA 1 - Headers principales (exactamente como en el archivo)
    const headers1 = [
      '', // Col A - vacía
      '', // Col B - vacía  
      'CLASE', // Col C
      'GRUPO', // Col D
      'CUENTA', // Col E
      'SUBCUENTA', // Col F
      'DETALLE', // Col G
      'I. D.', // Col H
      'DESCRIPCION', // Col I
      'TC$', // Col J,
      'Centro de Costos', // Col K
      'Movimientos', // Col L
      '', // Col M - vacía
      'Tipo', // Col N
      '', // Col O - vacía
      '', // Col P - vacía
      '', // Col Q - vacía
      '', // Col R - vacía
      '', // Col S - vacía
      'Informacion Fiscal', // Col T
      '', // Col U - vacía
      '', // Col V - vacía
      '', // Col W - vacía
      '', // Col X - vacía
      'UVT $49,799', // Col Y
      '', // Col Z - vacía
      '' // Col AA - vacía
    ];

    // FILA 2 - Headers secundarios (exactamente como en el archivo)
    const headers2 = [
      'SALDO INICIAL', // Col A
      'SALDO FINAL', // Col B
      'C (1)', // Col C
      'CGG (2)', // Col D
      'CGUU(3)', // Col E
      'CGUUSS(4)', // Col F
      'CGGUUSSDD(5)', // Col G
      '', // Col H - vacía (corresponde a I.D.)
      '', // Col I - vacía (corresponde a DESCRIPCION)
      'OM', // Col J
      '', // Col K - vacía
      'Debitos', // Col L
      'Creditos', // Col M
      'Cta', // Col N
      'NL', // Col O
      'AT', // Col P
      'CT', // Col Q
      'CC', // Col R
      'TI', // Col S
      'F350', // Col T
      'F300', // Col U
      'Exogena', // Col V
      'ICA', // Col W
      'DR(110)', // Col X
      'Conciliacion Fiscal', // Col Y
      '', // Col Z - vacía
      '' // Col AA - vacía
    ];

    const datos = [headers1, headers2];

    // Si se solicitan ejemplos, agregar las filas de ejemplo del archivo original
    if (conEjemplos) {
      const ejemplos = [
        // Ejemplo 1 - ACTIVOS (Clase 1)
        [
          '', '', '1', '', '', '', '', '', 'ACTIVOS', '', '', '', '', 'G', '1', 
          '', '', '', '', '', '', '', '', '', '', '', ''
        ],
        // Ejemplo 2 - EFECTIVO (Grupo 11)
        [
          '', '', '', '11', '', '', '', '', 'EFECTIVO Y EQUIVALENTES', '', '', '', '', 'G', '2', 
          '', '', '', '', '', '', '', '', '', '', '', ''
        ],
        // Ejemplo 3 - CAJA (Cuenta 1105)
        [
          '', '', '', '', '1105', '', '', '', 'CAJA', '', '', '', '', 'G', '3', 
          '', '', '', '', '', '', '', '', '', '', '', ''
        ],
        // Ejemplo 4 - Caja principal (Subcuenta 110501)
        [
          '15630522.90', '', '', '', '', '110501', '', 'X', 'Caja principal', '', 'N / A', '', '', 'D', '4', 
          'X', 'X', '', '', '', '', '', '', '36', 'H2 (ESF - Patrimonio)', '12', ''
        ],
        // Ejemplo 5 - Caja menor (Subcuenta 110502)
        [
          '1500000.00', '', '', '', '', '110502', '', 'X', 'Caja menor', '', '000 00000', '', '', 'D', '4', 
          'X', '', '', '', '', '', '', '', '36', 'H2 (ESF - Patrimonio)', '12', ''
        ]
      ];
      
      datos.push(...ejemplos);
    }

    return datos;
  }

  private generarDatosInstrucciones(): string[][] {
    return [
      ['📋 INSTRUCCIONES PARA IMPORTAR PUC - TEMPLATE ACTUALIZADO'],
      [''],
      ['🔍 ESTRUCTURA DEL ARCHIVO:'],
      ['• La hoja debe llamarse "PUC" (puede cambiar el nombre en las opciones)'],
      ['• Las primeras 2 filas contienen los headers/columnas'],
      ['• Los datos deben comenzar desde la fila 3'],
      ['• Estructura basada en plantilla estándar colombiana'],
      [''],
      ['📊 COLUMNAS PRINCIPALES (Jerarquía):'],
      ['• CLASE (Col C): Código de clase (1 dígito) - Ej: 1, 2, 3, 4, 5, 6'],
      ['• GRUPO (Col D): Código de grupo (2 dígitos) - Ej: 11, 12, 21, 22'],
      ['• CUENTA (Col E): Código de cuenta (4 dígitos) - Ej: 1105, 1110, 2105'],
      ['• SUBCUENTA (Col F): Código de subcuenta (6 dígitos) - Ej: 110501, 110502'],
      ['• DETALLE (Col G): Código de detalle (8+ dígitos) - Ej: 11050101, 11050102'],
      ['• DESCRIPCION (Col I): Nombre de la cuenta (obligatorio)'],
      [''],
      ['📊 COLUMNAS DE SALDOS Y MOVIMIENTOS:'],
      ['• SALDO INICIAL (Col A): Saldo inicial de la cuenta'],
      ['• SALDO FINAL (Col B): Saldo final de la cuenta'],
      ['• Debitos (Col L): Total movimientos débito'],
      ['• Creditos (Col M): Total movimientos crédito'],
      [''],
      ['📊 COLUMNAS FISCALES (Información Fiscal):'],
      ['• F350 (Col T): Aplica formulario F350 (Retención en la fuente)'],
      ['• F300 (Col U): Aplica formulario F300'],
      ['• Exogena (Col V): Aplica información exógena'],
      ['• ICA (Col W): Aplica ICA (Impuesto de Industria y Comercio)'],
      ['• DR(110) (Col X): Aplica DR110'],
      ['• Conciliacion Fiscal (Col Y): Información de conciliación fiscal'],
      [''],
      ['🔄 NATURALEZA AUTOMÁTICA:'],
      ['• DEBITO: Clases 1, 5, 6, 7, 8 (Activos, Gastos, Costos)'],
      ['• CREDITO: Clases 2, 3, 4, 9 (Pasivos, Patrimonio, Ingresos)'],
      [''],
      ['💡 EJEMPLO DE ESTRUCTURA:'],
      ['• Fila 3: Clase "1" = ACTIVOS (Col C)'],
      ['• Fila 4: Grupo "11" = EFECTIVO Y EQUIVALENTES (Col D)'],
      ['• Fila 5: Cuenta "1105" = CAJA (Col E)'],
      ['• Fila 6: Subcuenta "110501" = Caja principal (Col F)'],
      ['• Fila 7: Detalle "11050101" = Caja principal sucursal A (Col G)'],
      [''],
      ['🔧 FORMATOS SOPORTADOS:'],
      ['• Números: 1000, 1000.50, 1,000.50'],
      ['• Booleanos: X, true/false, 1/0, si/no'],
      ['• Texto: cualquier cadena de texto'],
      ['• Códigos: solo números (se limpia automáticamente)']
    ];
  }

  // ===============================================
  // 🛠️ MÉTODOS AUXILIARES DE CONVERSIÓN
  // ===============================================

  private limpiarCodigo(valor: any): string {
    if (!valor) return '';
    const codigo = valor.toString().replace(/\D/g, ''); // Solo números
    return codigo.trim();
  }

  private limpiarTexto(valor: any): string | null {
    if (!valor) return null;
    const texto = valor.toString().trim();
    return texto.length > 0 ? texto : null;
  }

  private convertirNumero(valor: any): number {
    if (!valor) return 0;
    const numero = parseFloat(valor.toString().replace(/[^\d.-]/g, ''));
    return isNaN(numero) ? 0 : numero;
  }

  private convertirBooleano(valor: any): boolean {
    if (!valor) return false;
    const str = valor.toString().toLowerCase().trim();
    return ['x', 'true', '1', 'si', 'yes', 'sí'].includes(str);
  }
}
