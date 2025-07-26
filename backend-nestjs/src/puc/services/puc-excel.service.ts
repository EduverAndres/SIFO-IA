// backend-nestjs/src/puc/services/puc-excel.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CuentaPuc } from '../entities/cuenta-puc.entity';
import { ImportPucExcelDto, ExportPucExcelDto } from '../dto/import-puc-excel.dto';
import { 
  ExcelRowPuc, 
  ValidacionExcel, 
  ResultadoImportacion 
} from '../interfaces/excel-row.interface';

@Injectable()
export class PucExcelService {
  private readonly logger = new Logger(PucExcelService.name);

  constructor(
    @InjectRepository(CuentaPuc)
    private cuentaPucRepository: Repository<CuentaPuc>,
  ) {}

  // ===============================================
  // 📥 IMPORTACIÓN DESDE EXCEL
  // ===============================================

  async importarDesdeExcel(
    file: Express.Multer.File, 
    opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    this.logger.log(`Iniciando importación desde Excel: ${file.originalname}`);

    try {
      // 1. Validar el archivo
      const validacion = await this.validarArchivoExcel(file, opciones.hoja);
      
      if (!validacion.es_valido) {
        throw new BadRequestException({
          message: 'El archivo contiene errores',
          errores: validacion.errores,
          advertencias: validacion.advertencias
        });
      }

      // 2. Procesar los datos válidos
      const resultado = await this.procesarDatosExcel(
        validacion.datos_procesados, 
        opciones
      );

      this.logger.log(`Importación completada: ${resultado.resumen.insertadas} insertadas, ${resultado.resumen.actualizadas} actualizadas`);
      
      return resultado;

    } catch (error) {
      this.logger.error('Error en importación:', error);
      throw new BadRequestException(`Error al procesar archivo: ${error.message}`);
    }
  }

  async validarArchivoExcel(
    file: Express.Multer.File, 
    nombreHoja: string = 'PUC'
  ): Promise<ValidacionExcel> {
    this.logger.log('Validando archivo Excel...');

    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { 
        type: 'buffer',
        cellStyles: true,
        cellDates: true 
      });

      // Verificar que la hoja existe
      if (!workbook.SheetNames.includes(nombreHoja)) {
        return {
          es_valido: false,
          errores: [`La hoja "${nombreHoja}" no existe en el archivo. Hojas disponibles: ${workbook.SheetNames.join(', ')}`],
          advertencias: [],
          resumen: {
            total_filas: 0,
            filas_validas: 0,
            filas_con_errores: 0,
            clases_encontradas: 0,
            grupos_encontrados: 0,
            cuentas_encontradas: 0,
            subcuentas_encontradas: 0,
            detalles_encontrados: 0
          },
          datos_procesados: []
        };
      }

      const worksheet = workbook.Sheets[nombreHoja];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validar estructura del archivo
      const validacion = this.validarEstructuraExcel(rawData);
      
      return validacion;

    } catch (error) {
      this.logger.error('Error validando Excel:', error);
      return {
        es_valido: false,
        errores: [`Error leyendo archivo: ${error.message}`],
        advertencias: [],
        resumen: {
          total_filas: 0,
          filas_validas: 0,
          filas_con_errores: 0,
          clases_encontradas: 0,
          grupos_encontrados: 0,
          cuentas_encontradas: 0,
          subcuentas_encontradas: 0,
          detalles_encontrados: 0
        },
        datos_procesados: []
      };
    }
  }

  private validarEstructuraExcel(rawData: any[][]): ValidacionExcel {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const datosValidos: ExcelRowPuc[] = [];

    // Verificar que hay datos
    if (rawData.length < 3) {
      errores.push('El archivo debe tener al menos 3 filas (headers + 1 fila de datos)');
      return this.crearResultadoValidacion(false, errores, advertencias, datosValidos);
    }

    // Validar headers (se esperan en las filas 0 y 1)
    const headersRow0 = rawData[0] || [];
    const headersRow1 = rawData[1] || [];

    // Verificar columnas esperadas según el template
    const columnasEsperadas = [
      { index: 2, nombre: 'CLASE' },
      { index: 3, nombre: 'GRUPO' },
      { index: 4, nombre: 'CUENTA' },
      { index: 5, nombre: 'SUBCUENTA' },
      { index: 6, nombre: 'DETALLE' },
      { index: 8, nombre: 'DESCRIPCION' }
    ];

    for (const columna of columnasEsperadas) {
      const header0 = headersRow0[columna.index];
      const header1 = headersRow1[columna.index];
      
      if (!header0 && !header1) {
        errores.push(`Columna ${columna.nombre} no encontrada en posición ${columna.index}`);
      }
    }

    if (errores.length > 0) {
      return this.crearResultadoValidacion(false, errores, advertencias, datosValidos);
    }

    // Procesar filas de datos (desde fila 2 en adelante)
    let contadores = {
      clases: new Set(),
      grupos: new Set(),
      cuentas: new Set(),
      subcuentas: new Set(),
      detalles: new Set()
    };

    for (let i = 2; i < rawData.length; i++) {
      const fila = rawData[i];
      
      // Saltar filas vacías
      if (!fila || fila.every(cell => !cell || cell === '')) {
        continue;
      }

      const filaProcesada = this.procesarFilaExcel(fila, i);
      
      if (filaProcesada) {
        datosValidos.push(filaProcesada);
        
        // Contar tipos de cuentas
        if (filaProcesada.codigo_clase) contadores.clases.add(filaProcesada.codigo_clase);
        if (filaProcesada.codigo_grupo) contadores.grupos.add(filaProcesada.codigo_grupo);
        if (filaProcesada.codigo_cuenta) contadores.cuentas.add(filaProcesada.codigo_cuenta);
        if (filaProcesada.codigo_subcuenta) contadores.subcuentas.add(filaProcesada.codigo_subcuenta);
        if (filaProcesada.codigo_detalle) contadores.detalles.add(filaProcesada.codigo_detalle);
      }
    }

    // Validaciones adicionales
    if (datosValidos.length === 0) {
      errores.push('No se encontraron filas válidas de datos');
    }

    const esValido = errores.length === 0;
    
    return {
      es_valido: esValido,
      errores,
      advertencias,
      resumen: {
        total_filas: rawData.length - 2, // Sin contar headers
        filas_validas: datosValidos.length,
        filas_con_errores: (rawData.length - 2) - datosValidos.length,
        clases_encontradas: contadores.clases.size,
        grupos_encontrados: contadores.grupos.size,
        cuentas_encontradas: contadores.cuentas.size,
        subcuentas_encontradas: contadores.subcuentas.size,
        detalles_encontrados: contadores.detalles.size
      },
      datos_procesados: datosValidos
    };
  }

  private procesarFilaExcel(fila: any[], numeroFila: number): ExcelRowPuc | null {
    try {
      // Mapear según la estructura del template del cliente
      const filaProcesada: ExcelRowPuc = {
        fila: numeroFila,
        saldo_inicial: this.parseNumber(fila[0]),
        saldo_final: this.parseNumber(fila[1]),
        codigo_clase: this.parseString(fila[2]),
        codigo_grupo: this.parseString(fila[3]),
        codigo_cuenta: this.parseString(fila[4]),
        codigo_subcuenta: this.parseString(fila[5]),
        codigo_detalle: this.parseString(fila[6]),
        id_movimiento: this.parseString(fila[7]),
        descripcion: this.parseString(fila[8]),
        tipo_om: this.parseString(fila[9]),
        centro_costos: this.parseString(fila[10]),
        movimientos_debito: this.parseNumber(fila[11]),
        movimientos_credito: this.parseNumber(fila[12]),
        tipo_cta: this.parseString(fila[13]),
        nivel: this.parseNumber(fila[14]),
        codigo_at: this.parseString(fila[15]),
        codigo_ct: this.parseString(fila[16]),
        codigo_cc: this.parseString(fila[17]),
        codigo_ti: this.parseString(fila[18]),
        aplica_f350: this.parseBoolean(fila[19]),
        aplica_f300: this.parseBoolean(fila[20]),
        aplica_exogena: this.parseBoolean(fila[21]),
        aplica_ica: this.parseBoolean(fila[22]),
        aplica_dr110: this.parseBoolean(fila[23]),
        conciliacion_fiscal: this.parseString(fila[24])
      };

      // Validar que al menos tenga descripción y algún código
      if (!filaProcesada.descripcion) {
        return null;
      }

      const tieneCodigo = filaProcesada.codigo_clase || 
                         filaProcesada.codigo_grupo || 
                         filaProcesada.codigo_cuenta || 
                         filaProcesada.codigo_subcuenta || 
                         filaProcesada.codigo_detalle;

      if (!tieneCodigo) {
        return null;
      }

      return filaProcesada;

    } catch (error) {
      this.logger.warn(`Error procesando fila ${numeroFila}:`, error.message);
      return null;
    }
  }

  private async procesarDatosExcel(
    datos: ExcelRowPuc[], 
    opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    const resultado: ResultadoImportacion = {
      exito: true,
      mensaje: 'Importación completada',
      resumen: {
        total_procesadas: datos.length,
        insertadas: 0,
        actualizadas: 0,
        errores: 0,
        omitidas: 0
      },
      errores: [],
      advertencias: []
    };

    for (const fila of datos) {
      try {
        // Determinar el código completo
        const codigoCompleto = this.determinarCodigoCompleto(fila);
        
        if (!codigoCompleto) {
          resultado.resumen.omitidas++;
          continue;
        }

        // Verificar si ya existe
        const cuentaExistente = await this.cuentaPucRepository.findOne({
          where: { codigo_completo: codigoCompleto }
        });

        if (cuentaExistente && !opciones.sobreescribir) {
          resultado.resumen.omitidas++;
          resultado.advertencias.push(`Cuenta ${codigoCompleto} ya existe (fila ${fila.fila})`);
          continue;
        }

        // Crear o actualizar cuenta
        const datosGuardar = this.mapearDatosParaGuardar(fila, codigoCompleto);

        if (cuentaExistente && opciones.sobreescribir) {
          await this.cuentaPucRepository.update(cuentaExistente.id, datosGuardar);
          resultado.resumen.actualizadas++;
        } else {
          await this.cuentaPucRepository.save(datosGuardar);
          resultado.resumen.insertadas++;
        }

      } catch (error) {
        resultado.resumen.errores++;
        resultado.errores.push({
          fila: fila.fila,
          codigo: this.determinarCodigoCompleto(fila),
          error: error.message
        });
      }
    }

    resultado.exito = resultado.resumen.errores === 0;
    
    return resultado;
  }

  // ===============================================
  // 📤 EXPORTACIÓN A EXCEL  
  // ===============================================

  async exportarAExcel(opciones: ExportPucExcelDto): Promise<Buffer> {
    this.logger.log('Iniciando exportación a Excel...');

    try {
      // Obtener datos según filtros
      const cuentas = await this.obtenerCuentasParaExportar(opciones);

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Crear hoja con los datos
      const worksheetData = this.crearDatosHojaExcel(cuentas, opciones);
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Aplicar estilos y formato
      this.aplicarFormatoExcel(worksheet, worksheetData.length);

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PUC');

      // Convertir a buffer
      const buffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });

      this.logger.log(`Exportación completada: ${cuentas.length} cuentas`);
      
      return buffer;

    } catch (error) {
      this.logger.error('Error exportando a Excel:', error);
      throw new BadRequestException(`Error generando archivo Excel: ${error.message}`);
    }
  }

  async generarTemplateExcel(conEjemplos: boolean = true): Promise<Buffer> {
    this.logger.log('Generando template de Excel...');

    try {
      const workbook = XLSX.utils.book_new();

      // Crear headers según el template del cliente
      const headers = [
        [null, null, 'CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'DETALLE', 'I. D.', 'DESCRIPCION', 'TC$', 'Centro de Costos', 'Movimientos', null, 'Tipo', null, null, null, null, null, 'Informacion Fiscal', null, null, null, null, 'UVT $49,799'],
        ['SALDO INICIAL', 'SALDO FINAL', 'C (1)', 'CGG (2)', 'CGUU(3)', 'CGUUSS(4)', 'CGGUUSSDD(5)', null, null, 'OM', null, 'Debitos', 'Creditos', 'Cta', 'NL', 'AT', 'CT', 'CC', 'TI', 'F350', 'F300', 'Exogena', 'ICA', 'DR(110)', 'Conciliacion Fiscal']
      ];

      // Agregar filas de ejemplo si se solicita
      if (conEjemplos) {
        headers.push(
          [21864301859.74, null, 1, null, null, null, null, null, 'ACTIVOS', null, null, null, null, 'G', 1],
          [1912615578.68, null, null, 11, null, null, null, null, 'EFECTIVO Y EQUIVALENTES AL EFECTIVO', null, null, null, null, 'G', 2],
          [17130522.9, null, null, null, 1105, null, null, null, 'CAJA', null, null, null, null, 'G', 3],
          [15630522.9, null, null, null, null, 110501, null, 'X', 'Caja principal', null, 'N / A', null, null, 'D', 4, 'X', 'X', null, null, null, null, null, null, 36, 'H2 (ESF - Patrimonio)'],
          [1500000, null, null, null, null, 110502, null, 'X', 'Caja menor', null, '000 00000', null, null, 'D', 4, 'X', null, null, null, null, null, null, null, 36, 'H2 (ESF - Patrimonio)']
        );
      }

      const worksheet = XLSX.utils.aoa_to_sheet(headers);
      
      // Aplicar formato al template
      this.aplicarFormatoTemplate(worksheet);

      XLSX.utils.book_append_sheet(workbook, worksheet, 'PUC');

      const buffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });

      this.logger.log('Template generado exitosamente');
      return buffer;

    } catch (error) {
      this.logger.error('Error generando template:', error);
      throw new BadRequestException(`Error generando template: ${error.message}`);
    }
  }

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES
  // ===============================================

  private async obtenerCuentasParaExportar(opciones: ExportPucExcelDto): Promise<CuentaPuc[]> {
    const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

    // Aplicar filtros
    if (opciones.filtro_estado && opciones.filtro_estado !== 'TODAS') {
      query.andWhere('cuenta.estado = :estado', { estado: opciones.filtro_estado });
    }

    if (opciones.filtro_tipo) {
      query.andWhere('cuenta.tipo_cuenta = :tipo', { tipo: opciones.filtro_tipo });
    }

    query.andWhere('cuenta.activo = :activo', { activo: true });
    query.orderBy('cuenta.codigo_completo', 'ASC');

    return await query.getMany();
  }

  private crearDatosHojaExcel(cuentas: CuentaPuc[], opciones: ExportPucExcelDto): any[][] {
    // Headers según template del cliente
    const datos = [
      [null, null, 'CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'DETALLE', 'I. D.', 'DESCRIPCION', 'TC, 'Centro de Costos', 'Movimientos', null, 'Tipo', null, null, null, null, null, 'Informacion Fiscal', null, null, null, null, 'UVT $49,799'],
      ['SALDO INICIAL', 'SALDO FINAL', 'C (1)', 'CGG (2)', 'CGUU(3)', 'CGUUSS(4)', 'CGGUUSSDD(5)', null, null, 'OM', null, 'Debitos', 'Creditos', 'Cta', 'NL', 'AT', 'CT', 'CC', 'TI', 'F350', 'F300', 'Exogena', 'ICA', 'DR(110)', 'Conciliacion Fiscal']
    ];

    // Agregar datos de cuentas
    for (const cuenta of cuentas) {
      const fila = [
        opciones.incluir_saldos ? cuenta.saldo_inicial || 0 : null,
        opciones.incluir_saldos ? cuenta.saldo_final || 0 : null,
        cuenta.codigo_clase || null,
        cuenta.codigo_grupo || null,
        cuenta.codigo_cuenta || null,
        cuenta.codigo_subcuenta || null,
        cuenta.codigo_detalle || null,
        cuenta.id_movimiento || null,
        cuenta.nombre,
        cuenta.tipo_om || null,
        cuenta.centro_costos || null,
        opciones.incluir_movimientos ? cuenta.movimientos_debito || 0 : null,
        opciones.incluir_movimientos ? cuenta.movimientos_credito || 0 : null,
        cuenta.tipo_cta || (cuenta.acepta_movimientos ? 'D' : 'G'),
        cuenta.nivel,
        cuenta.codigo_at || null,
        cuenta.codigo_ct || null,
        cuenta.codigo_cc || null,
        cuenta.codigo_ti || null,
        opciones.incluir_fiscal ? (cuenta.aplica_f350 ? 'X' : null) : null,
        opciones.incluir_fiscal ? (cuenta.aplica_f300 ? 'X' : null) : null,
        opciones.incluir_fiscal ? (cuenta.aplica_exogena ? 'X' : null) : null,
        opciones.incluir_fiscal ? (cuenta.aplica_ica ? 'X' : null) : null,
        opciones.incluir_fiscal ? (cuenta.aplica_dr110 ? 'X' : null) : null,
        cuenta.conciliacion_fiscal || null
      ];

      datos.push(fila);
    }

    return datos;
  }

  private aplicarFormatoExcel(worksheet: XLSX.WorkSheet, totalFilas: number): void {
    // Configurar ancho de columnas
    const anchos = [
      { wch: 15 }, // SALDO INICIAL
      { wch: 15 }, // SALDO FINAL
      { wch: 8 },  // CLASE
      { wch: 8 },  // GRUPO
      { wch: 10 }, // CUENTA
      { wch: 12 }, // SUBCUENTA
      { wch: 15 }, // DETALLE
      { wch: 8 },  // I.D.
      { wch: 40 }, // DESCRIPCION
      { wch: 8 },  // TC$
      { wch: 15 }, // Centro de Costos
      { wch: 12 }, // Movimientos
      { wch: 12 }, // Creditos
      { wch: 8 },  // Tipo
      { wch: 5 },  // NL
      { wch: 5 },  // AT
      { wch: 5 },  // CT
      { wch: 5 },  // CC
      { wch: 5 },  // TI
      { wch: 8 },  // F350
      { wch: 8 },  // F300
      { wch: 8 },  // Exogena
      { wch: 8 },  // ICA
      { wch: 8 },  // DR(110)
      { wch: 20 }  // Conciliacion Fiscal
    ];

    worksheet['!cols'] = anchos;

    // Configurar rango de datos
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Y1');
    range.e.r = totalFilas - 1;
    worksheet['!ref'] = XLSX.utils.encode_range(range);
  }

  private aplicarFormatoTemplate(worksheet: XLSX.WorkSheet): void {
    this.aplicarFormatoExcel(worksheet, 7); // Template tiene pocas filas

    // Agregar comentarios/notas en celdas importantes
    const comentarios = {
      'C1': 'CLASE: Código de 1 dígito (1-9)',
      'D1': 'GRUPO: Código de 2 dígitos (11, 12, etc.)',
      'E1': 'CUENTA: Código de 4 dígitos (1105, 1110, etc.)',
      'F1': 'SUBCUENTA: Código de 6 dígitos (110501, etc.)',
      'G1': 'DETALLE: Código de 8+ dígitos',
      'I1': 'DESCRIPCION: Nombre de la cuenta (obligatorio)',
      'N1': 'Cta: G=Grupo (no acepta mov.), D=Detalle (acepta mov.)'
    };

    // Nota: En un entorno real, aquí se aplicarían los comentarios
    // worksheet[celda] = { ...worksheet[celda], c: [{ a: 'Sistema', t: comentario }] };
  }

  private determinarCodigoCompleto(fila: ExcelRowPuc): string | null {
    // Retorna el código más específico disponible
    if (fila.codigo_detalle) return fila.codigo_detalle;
    if (fila.codigo_subcuenta) return fila.codigo_subcuenta;
    if (fila.codigo_cuenta) return fila.codigo_cuenta;
    if (fila.codigo_grupo) return fila.codigo_grupo;
    if (fila.codigo_clase) return fila.codigo_clase;
    return null;
  }

  private mapearDatosParaGuardar(fila: ExcelRowPuc, codigoCompleto: string): Partial<CuentaPuc> {
    return {
      codigo_completo: codigoCompleto,
      codigo_clase: fila.codigo_clase,
      codigo_grupo: fila.codigo_grupo,
      codigo_cuenta: fila.codigo_cuenta,
      codigo_subcuenta: fila.codigo_subcuenta,
      codigo_detalle: fila.codigo_detalle,
      nombre: fila.descripcion,
      nivel: fila.nivel || this.calcularNivel(fila),
      tipo_cta: fila.tipo_cta || 'D',
      acepta_movimientos: fila.tipo_cta === 'D',
      id_movimiento: fila.id_movimiento,
      centro_costos: fila.centro_costos,
      saldo_inicial: fila.saldo_inicial || 0,
      saldo_final: fila.saldo_final || 0,
      movimientos_debito: fila.movimientos_debito || 0,
      movimientos_credito: fila.movimientos_credito || 0,
      tipo_om: fila.tipo_om,
      codigo_at: fila.codigo_at,
      codigo_ct: fila.codigo_ct,
      codigo_cc: fila.codigo_cc,
      codigo_ti: fila.codigo_ti,
      aplica_f350: fila.aplica_f350 || false,
      aplica_f300: fila.aplica_f300 || false,
      aplica_exogena: fila.aplica_exogena || false,
      aplica_ica: fila.aplica_ica || false,
      aplica_dr110: fila.aplica_dr110 || false,
      conciliacion_fiscal: fila.conciliacion_fiscal,
      fila_excel: fila.fila,
      naturaleza: this.determinarNaturaleza(codigoCompleto),
      tipo_cuenta: this.determinarTipoCuenta(fila),
      estado: 'ACTIVA' as any,
      activo: true
    };
  }

  private calcularNivel(fila: ExcelRowPuc): number {
    if (fila.codigo_detalle) return 5;
    if (fila.codigo_subcuenta) return 4;
    if (fila.codigo_cuenta) return 3;
    if (fila.codigo_grupo) return 2;
    if (fila.codigo_clase) return 1;
    return 1;
  }

  private determinarNaturaleza(codigo: string): 'DEBITO' | 'CREDITO' {
    const primerDigito = codigo.charAt(0);
    return ['1', '5', '6', '7'].includes(primerDigito) ? 'DEBITO' : 'CREDITO';
  }

  private determinarTipoCuenta(fila: ExcelRowPuc): string {
    if (fila.codigo_detalle) return 'DETALLE';
    if (fila.codigo_subcuenta) return 'SUBCUENTA';
    if (fila.codigo_cuenta) return 'CUENTA';
    if (fila.codigo_grupo) return 'GRUPO';
    if (fila.codigo_clase) return 'CLASE';
    return 'DETALLE';
  }

  private crearResultadoValidacion(
    esValido: boolean, 
    errores: string[], 
    advertencias: string[], 
    datos: ExcelRowPuc[]
  ): ValidacionExcel {
    return {
      es_valido: esValido,
      errores,
      advertencias,
      resumen: {
        total_filas: datos.length,
        filas_validas: datos.length,
        filas_con_errores: 0,
        clases_encontradas: 0,
        grupos_encontrados: 0,
        cuentas_encontradas: 0,
        subcuentas_encontradas: 0,
        detalles_encontrados: 0
      },
      datos_procesados: datos
    };
  }

  // Métodos de parsing seguros
  private parseString(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;
    return String(value).trim();
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private parseBoolean(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    const str = String(value).toUpperCase().trim();
    return ['X', 'TRUE', '1', 'SI', 'SÍ', 'YES'].includes(str);
  }
}