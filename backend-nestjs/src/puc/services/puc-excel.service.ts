// backend-nestjs/src/puc/services/puc-excel.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CuentaPuc } from '../entities/cuenta-puc.entity';
import { ImportPucExcelDto } from '../dto/import-puc-excel.dto';
import { ExportPucExcelDto } from '../dto/export-puc-excel.dto';
import { 
  ExcelRowPuc, 
  ValidacionExcel, 
  ResultadoImportacion 
} from '../interfaces/excel-row.interface';
import { TipoCuentaEnum, NaturalezaCuentaEnum, EstadoCuentaEnum } from '../entities/cuenta-puc.entity';

// Extender la interfaz ExcelRowPuc para incluir codigo_completo
interface ExcelRowPucExtended extends ExcelRowPuc {
  codigo_completo: string;
}

@Injectable()
export class PucExcelService {
  private readonly logger = new Logger(PucExcelService.name);

  constructor(
    @InjectRepository(CuentaPuc)
    private cuentaPucRepository: Repository<CuentaPuc>
  ) {}

  // ===============================================
  // 📥 MÉTODOS DE IMPORTACIÓN
  // ===============================================

  async importarDesdeExcel(
    file: Express.Multer.File,
    opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    this.logger.log(`🔄 Iniciando importación de ${file.originalname}`);
    
    try {
      // 1. Leer archivo Excel
      const workbook = XLSX.read(file.buffer, { 
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      // 2. Verificar que existe la hoja
      const nombreHoja = opciones.hoja || 'PUC';
      if (!workbook.SheetNames.includes(nombreHoja)) {
        throw new BadRequestException(`No se encontró la hoja "${nombreHoja}" en el archivo`);
      }

      // 3. Validar archivo antes de importar
      const validacion = await this.validarArchivoExcel(file, opciones.hoja);
      if (!validacion.es_valido) {
        return {
          exito: false,
          mensaje: 'El archivo contiene errores de validación',
          resumen: {
            total_procesadas: 0,
            insertadas: 0,
            actualizadas: 0,
            errores: validacion.errores.length,
            omitidas: 0
          },
          errores: validacion.errores.map((error, index) => ({
            fila: index + 1,
            error
          })),
          advertencias: validacion.advertencias
        };
      }

      // 4. Procesar los datos validados
      const resultado = await this.procesarDatosImportacion(
        validacion.datos_procesados,
        opciones
      );

      this.logger.log(`✅ Importación completada: ${resultado.resumen.insertadas} insertadas, ${resultado.resumen.actualizadas} actualizadas`);
      return resultado;

    } catch (error) {
      this.logger.error('❌ Error durante la importación:', error);
      throw new BadRequestException(`Error procesando archivo: ${error.message}`);
    }
  }

  async validarArchivoExcel(
    file: Express.Multer.File,
    nombreHoja: string = 'PUC'
  ): Promise<ValidacionExcel> {
    this.logger.log(`🔍 Validando archivo Excel: ${file.originalname}`);

    try {
      // Leer workbook
      const workbook = XLSX.read(file.buffer, { 
        type: 'buffer',
        cellDates: true
      });

      // Verificar hoja
      if (!workbook.SheetNames.includes(nombreHoja)) {
        return {
          es_valido: false,
          errores: [`No se encontró la hoja "${nombreHoja}" en el archivo`],
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
      
      // Convertir a JSON con headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length === 0) {
        return {
          es_valido: false,
          errores: ['El archivo está vacío'],
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

      // Procesar headers y datos
      const headers = this.normalizarHeaders(jsonData[0] as unknown[]);
      const datosFilas = jsonData.slice(1) as unknown[][];

      // Validar headers mínimos
      const headersRequeridos = ['codigo_completo', 'nombre'];
      const headersFaltantes = headersRequeridos.filter(h => !headers.includes(h));
      
      const errores: string[] = [];
      const advertencias: string[] = [];
      
      if (headersFaltantes.length > 0) {
        errores.push(`Headers requeridos faltantes: ${headersFaltantes.join(', ')}`);
      }

      // Procesar filas de datos
      const datosProcessados: ExcelRowPuc[] = [];
      let contadores = {
        clases: 0,
        grupos: 0,
        cuentas: 0,
        subcuentas: 0,
        detalles: 0
      };

      datosFilas.forEach((fila, index) => {
        const numeroFila = index + 2; // +2 porque empezamos desde fila 2 (después del header)
        
        try {
          const filaData = this.procesarFilaExcel(fila, headers, numeroFila);
          
          if (filaData && filaData.codigo_completo) {
            // Validar datos de la fila
            const validacionFila = this.validarFilaData(filaData as ExcelRowPucExtended, numeroFila);
            
            if (validacionFila.errores.length > 0) {
              errores.push(...validacionFila.errores);
            }
            
            if (validacionFila.advertencias.length > 0) {
              advertencias.push(...validacionFila.advertencias);
            }

            datosProcessados.push(filaData);

            // Contar por nivel
            const longitud = filaData.codigo_completo.length;
            if (longitud === 1) contadores.clases++;
            else if (longitud === 2) contadores.grupos++;
            else if (longitud === 4) contadores.cuentas++;
            else if (longitud === 6) contadores.subcuentas++;
            else if (longitud === 8) contadores.detalles++;
          }
        } catch (error) {
          errores.push(`Fila ${numeroFila}: Error procesando datos - ${error.message}`);
        }
      });

      const esValido = errores.length === 0;

      return {
        es_valido: esValido,
        errores,
        advertencias,
        resumen: {
          total_filas: datosProcessados.length,
          filas_validas: esValido ? datosProcessados.length : 0,
          filas_con_errores: errores.length,
          clases_encontradas: contadores.clases,
          grupos_encontrados: contadores.grupos,
          cuentas_encontradas: contadores.cuentas,
          subcuentas_encontradas: contadores.subcuentas,
          detalles_encontrados: contadores.detalles
        },
        datos_procesados: datosProcessados
      };

    } catch (error) {
      this.logger.error('❌ Error validando archivo:', error);
      return {
        es_valido: false,
        errores: [`Error procesando archivo: ${error.message}`],
        advertencias: [],
        resumen: {
          total_filas: 0,
          filas_validas: 0,
          filas_con_errores: 1,
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

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN
  // ===============================================

  async exportarAExcel(opciones: ExportPucExcelDto): Promise<Buffer> {
    this.logger.log('📤 Iniciando exportación a Excel');

    try {
      // 1. Obtener datos según filtros
      const cuentas = await this.obtenerCuentasParaExportar(opciones);
      
      // 2. Preparar datos para Excel
      const datosExcel = this.prepararDatosParaExportacion(cuentas, opciones);

      // 3. Crear workbook
      const workbook = XLSX.utils.book_new();

      // 4. Crear worksheet con los datos
      const worksheet = XLSX.utils.aoa_to_sheet(datosExcel);

      // 5. Configurar formato de columnas
      this.configurarFormatoWorksheet(worksheet, datosExcel[0].length);

      // 6. Agregar hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PUC');

      // 7. Generar buffer
      const buffer = XLSX.write(workbook, { 
        type: 'buffer',
        bookType: 'xlsx',
        compression: true
      });
      
      this.logger.log(`✅ Exportación completada: ${cuentas.length} cuentas exportadas`);
      return buffer;

    } catch (error) {
      this.logger.error('❌ Error durante la exportación:', error);
      throw new BadRequestException(`Error generando archivo Excel: ${error.message}`);
    }
  }

  async generarTemplateExcel(conEjemplos: boolean = true): Promise<Buffer> {
    this.logger.log('📄 Generando template Excel');

    try {
      const workbook = XLSX.utils.book_new();

      // 1. Crear hoja principal con template
      const datosTemplate = this.generarDatosTemplate(conEjemplos);
      const worksheetPuc = XLSX.utils.aoa_to_sheet(datosTemplate);
      
      // Configurar formato
      this.configurarFormatoWorksheet(worksheetPuc, datosTemplate[0].length);
      
      // Agregar hoja PUC
      XLSX.utils.book_append_sheet(workbook, worksheetPuc, 'PUC');

      // 2. Crear hoja de instrucciones
      const datosInstrucciones = this.generarDatosInstrucciones();
      const worksheetInstrucciones = XLSX.utils.aoa_to_sheet(datosInstrucciones);
      
      // Agregar hoja de instrucciones
      XLSX.utils.book_append_sheet(workbook, worksheetInstrucciones, 'Instrucciones');

      // 3. Generar buffer
      const buffer = XLSX.write(workbook, { 
        type: 'buffer',
        bookType: 'xlsx',
        compression: true
      });

      this.logger.log('✅ Template generado exitosamente');
      return buffer;

    } catch (error) {
      this.logger.error('❌ Error generando template:', error);
      throw new BadRequestException(`Error generando template: ${error.message}`);
    }
  }

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES PRIVADOS
  // ===============================================

  private normalizarHeaders(headers: unknown[]): string[] {
    return headers.map(header => {
      if (!header) return '';
      
      const headerLimpio = header.toString().toLowerCase().trim();
      
      // Mapear headers comunes del Excel
      const mapeoHeaders: { [key: string]: string } = {
        'codigo': 'codigo_completo',
        'código': 'codigo_completo',
        'codigo_completo': 'codigo_completo',
        'codigo_clase': 'codigo_clase',
        'codigo_grupo': 'codigo_grupo',
        'codigo_cuenta': 'codigo_cuenta',
        'codigo_subcuenta': 'codigo_subcuenta',
        'codigo_detalle': 'codigo_detalle',
        'nombre': 'nombre',
        'descripcion': 'descripcion',
        'descripción': 'descripcion',
        'saldo_inicial': 'saldo_inicial',
        'saldo_final': 'saldo_final',
        'movimientos_debito': 'movimientos_debito',
        'movimientos_credito': 'movimientos_credito',
        'nivel': 'nivel',
        'nl': 'nivel',
        'tipo_cta': 'tipo_cta',
        'naturaleza': 'naturaleza',
        'centro_costos': 'centro_costos',
        'f350': 'aplica_f350',
        'f300': 'aplica_f300',
        'exogena': 'aplica_exogena',
        'ica': 'aplica_ica',
        'dr110': 'aplica_dr110',
        'id_movimiento': 'id_movimiento',
        'i.d.': 'id_movimiento',
        'tipo_om': 'tipo_om',
        'codigo_at': 'codigo_at',
        'codigo_ct': 'codigo_ct',
        'codigo_cc': 'codigo_cc',
        'codigo_ti': 'codigo_ti',
        'conciliacion_fiscal': 'conciliacion_fiscal'
      };

      return mapeoHeaders[headerLimpio] || headerLimpio;
    });
  }

  private procesarFilaExcel(
    fila: unknown[],
    headers: string[],
    numeroFila: number
  ): (ExcelRowPuc & { codigo_completo?: string }) | null {
    const filaData: Partial<ExcelRowPuc & { codigo_completo?: string }> = { fila: numeroFila };

    headers.forEach((header, index) => {
      if (!header || index >= fila.length) return;

      const valor = fila[index];

      switch (header) {
        case 'codigo_completo':
          filaData.codigo_completo = this.limpiarCodigo(valor);
          break;
        case 'codigo_clase':
          filaData.codigo_clase = this.limpiarCodigo(valor);
          break;
        case 'codigo_grupo':
          filaData.codigo_grupo = this.limpiarCodigo(valor);
          break;
        case 'codigo_cuenta':
          filaData.codigo_cuenta = this.limpiarCodigo(valor);
          break;
        case 'codigo_subcuenta':
          filaData.codigo_subcuenta = this.limpiarCodigo(valor);
          break;
        case 'codigo_detalle':
          filaData.codigo_detalle = this.limpiarCodigo(valor);
          break;
        case 'nombre':
        case 'descripcion':
          filaData.descripcion = valor?.toString().trim();
          break;
        case 'saldo_inicial':
          filaData.saldo_inicial = this.parseNumero(valor);
          break;
        case 'saldo_final':
          filaData.saldo_final = this.parseNumero(valor);
          break;
        case 'movimientos_debito':
          filaData.movimientos_debito = this.parseNumero(valor);
          break;
        case 'movimientos_credito':
          filaData.movimientos_credito = this.parseNumero(valor);
          break;
        case 'nivel':
            if (valor !== null && valor !== undefined) {
                filaData.nivel = parseInt(valor.toString()) || undefined;
            }
            break;
        case 'tipo_cta':
          filaData.tipo_cta = valor?.toString().toUpperCase().trim();
          break;
        case 'naturaleza':
          // No existe en ExcelRowPuc, pero se puede agregar lógica si se necesita
          break;
        case 'centro_costos':
          filaData.centro_costos = valor?.toString().trim();
          break;
        case 'id_movimiento':
          filaData.id_movimiento = valor?.toString().trim();
          break;
        case 'tipo_om':
          filaData.tipo_om = valor?.toString().trim();
          break;
        case 'codigo_at':
          filaData.codigo_at = valor?.toString().trim();
          break;
        case 'codigo_ct':
          filaData.codigo_ct = valor?.toString().trim();
          break;
        case 'codigo_cc':
          filaData.codigo_cc = valor?.toString().trim();
          break;
        case 'codigo_ti':
          filaData.codigo_ti = valor?.toString().trim();
          break;
        case 'aplica_f350':
          filaData.aplica_f350 = this.parseBoolean(valor);
          break;
        case 'aplica_f300':
          filaData.aplica_f300 = this.parseBoolean(valor);
          break;
        case 'aplica_exogena':
          filaData.aplica_exogena = this.parseBoolean(valor);
          break;
        case 'aplica_ica':
          filaData.aplica_ica = this.parseBoolean(valor);
          break;
        case 'aplica_dr110':
          filaData.aplica_dr110 = this.parseBoolean(valor);
          break;
        case 'conciliacion_fiscal':
          filaData.conciliacion_fiscal = valor?.toString().trim();
          break;
      }
    });

    // Determinar codigo_completo si no está definido directamente
    if (!filaData.codigo_completo) {
      filaData.codigo_completo = this.determinarCodigoCompletoDesdeFilas(filaData);
    }

    // Solo retornar si tiene código
    return filaData.codigo_completo ? filaData as (ExcelRowPuc & { codigo_completo: string }) : null;
  }

  private determinarCodigoCompletoDesdeFilas(fila: Partial<ExcelRowPuc>): string {
    // Retorna el código más específico disponible
    if (fila.codigo_detalle) return fila.codigo_detalle;
    if (fila.codigo_subcuenta) return fila.codigo_subcuenta;
    if (fila.codigo_cuenta) return fila.codigo_cuenta;
    if (fila.codigo_grupo) return fila.codigo_grupo;
    if (fila.codigo_clase) return fila.codigo_clase;
    return '';
  }

  private validarFilaData(
    fila: ExcelRowPucExtended,
    numeroFila: number
  ): { errores: string[]; advertencias: string[] } {
    const errores: string[] = [];
    const advertencias: string[] = [];

    // Validar código
    if (!fila.codigo_completo) {
      errores.push(`Fila ${numeroFila}: Código es requerido`);
    } else {
      // Validar formato de código
      if (!/^\d+$/.test(fila.codigo_completo)) {
        errores.push(`Fila ${numeroFila}: Código debe contener solo números`);
      }

      // Validar longitud
      const longitud = fila.codigo_completo.length;
      if (![1, 2, 4, 6, 8].includes(longitud)) {
        errores.push(`Fila ${numeroFila}: Longitud de código inválida (${longitud}). Debe ser 1, 2, 4, 6 u 8 dígitos`);
      }
    }

    // Validar nombre/descripción
    if (!fila.descripcion || fila.descripcion.trim().length === 0) {
      errores.push(`Fila ${numeroFila}: Nombre/descripción es requerida`);
    }

    // Validar nivel si está presente
    if (fila.nivel && (fila.nivel < 1 || fila.nivel > 5)) {
      advertencias.push(`Fila ${numeroFila}: Nivel fuera del rango esperado (1-5)`);
    }

    // Validar saldos
    if (fila.saldo_inicial !== undefined && isNaN(fila.saldo_inicial)) {
      errores.push(`Fila ${numeroFila}: Saldo inicial no es un número válido`);
    }

    if (fila.saldo_final !== undefined && isNaN(fila.saldo_final)) {
      errores.push(`Fila ${numeroFila}: Saldo final no es un número válido`);
    }

    return { errores, advertencias };
  }

  private async procesarDatosImportacion(
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

    // Ordenar datos por jerarquía (padres primero)
    const datosOrdenados = datos.sort((a, b) => {
      const codigoA = this.obtenerCodigoCompleto(a);
      const codigoB = this.obtenerCodigoCompleto(b);
      const longitudA = codigoA.length;
      const longitudB = codigoB.length;
      if (longitudA !== longitudB) return longitudA - longitudB;
      return codigoA.localeCompare(codigoB);
    });

    for (const fila of datosOrdenados) {
      try {
        await this.procesarFilaIndividual(fila, opciones, resultado);
      } catch (error) {
        resultado.resumen.errores++;
        resultado.errores.push({
          fila: fila.fila,
          codigo: this.obtenerCodigoCompleto(fila),
          error: error.message
        });
      }
    }

    resultado.exito = resultado.resumen.errores === 0;
    return resultado;
  }

  private obtenerCodigoCompleto(fila: ExcelRowPuc): string {
    // Buscar el código más específico disponible
    if (fila.codigo_detalle) return fila.codigo_detalle;
    if (fila.codigo_subcuenta) return fila.codigo_subcuenta;
    if (fila.codigo_cuenta) return fila.codigo_cuenta;
    if (fila.codigo_grupo) return fila.codigo_grupo;
    if (fila.codigo_clase) return fila.codigo_clase;
    return '';
  }

  private async procesarFilaIndividual(
    fila: ExcelRowPuc,
    opciones: ImportPucExcelDto,
    resultado: ResultadoImportacion
  ): Promise<void> {
    const codigo = this.obtenerCodigoCompleto(fila);
    
    if (!codigo) {
      throw new Error('No se pudo determinar el código completo de la cuenta');
    }
    
    // Verificar si ya existe
    const existente = await this.cuentaPucRepository.findOne({
      where: { codigo_completo: codigo }
    });

    if (existente) {
      if (opciones.sobreescribir) {
        // Actualizar cuenta existente
        await this.actualizarCuentaExistente(existente, fila, opciones);
        resultado.resumen.actualizadas++;
      } else {
        resultado.resumen.omitidas++;
        resultado.advertencias.push(`Cuenta ${codigo} ya existe y no se actualizó`);
      }
    } else {
      // Crear nueva cuenta
      await this.crearNuevaCuenta(fila, opciones);
      resultado.resumen.insertadas++;
    }
  }

  private async crearNuevaCuenta(
    fila: ExcelRowPuc,
    opciones: ImportPucExcelDto
  ): Promise<CuentaPuc> {
    const cuenta = new CuentaPuc();
    
    // Determinar el código completo
    const codigoCompleto = this.obtenerCodigoCompleto(fila);
    
    // Datos básicos
    cuenta.codigo_completo = codigoCompleto;
    cuenta.nombre = fila.descripcion || '';
    cuenta.nivel = fila.nivel || this.calcularNivelPorCodigo(codigoCompleto);
    
    // Asignar códigos jerárquicos
    this.asignarCodigosJerarquicos(cuenta, fila);
    
    // Determinar tipo según longitud
    cuenta.tipo_cuenta = this.determinarTipoCuenta(codigoCompleto);
    
    // Configurar jerarquía
    cuenta.codigo_padre = this.calcularCodigoPadre(codigoCompleto);
    
    // Configurar según tipo de cuenta
    cuenta.tipo_cta = fila.tipo_cta || (cuenta.nivel === 5 ? 'D' : 'G');
    cuenta.acepta_movimientos = cuenta.nivel === 5; // Solo detalles aceptan movimientos
    
    // Naturaleza (por defecto según clase)
    cuenta.naturaleza = this.determinarNaturaleza(undefined, codigoCompleto);
    
    // Saldos si se deben importar
    if (opciones.importar_saldos) {
      cuenta.saldo_inicial = fila.saldo_inicial || 0;
      cuenta.saldo_final = fila.saldo_final || 0;
      cuenta.movimientos_debito = fila.movimientos_debito || 0;
      cuenta.movimientos_credito = fila.movimientos_credito || 0;
    }

    // Información fiscal si se debe importar
    if (opciones.importar_fiscal) {
      cuenta.aplica_f350 = fila.aplica_f350 || false;
      cuenta.aplica_f300 = fila.aplica_f300 || false;
      cuenta.aplica_exogena = fila.aplica_exogena || false;
      cuenta.aplica_ica = fila.aplica_ica || false;
      cuenta.aplica_dr110 = fila.aplica_dr110 || false;
    }

    // Otros campos del Excel
    cuenta.centro_costos = fila.centro_costos || null;
    cuenta.id_movimiento = fila.id_movimiento || null;
    cuenta.tipo_om = fila.tipo_om || null;
    cuenta.codigo_at = fila.codigo_at || null;
    cuenta.codigo_ct = fila.codigo_ct || null;
    cuenta.codigo_cc = fila.codigo_cc || null;
    cuenta.codigo_ti = fila.codigo_ti || null;
    cuenta.conciliacion_fiscal = fila.conciliacion_fiscal || null;
    cuenta.fila_excel = fila.fila;
    
    // Campos por defecto
    cuenta.estado = EstadoCuentaEnum.ACTIVA;
    cuenta.activo = true;

    return await this.cuentaPucRepository.save(cuenta);
  }

  private asignarCodigosJerarquicos(cuenta: CuentaPuc, fila: ExcelRowPuc): void {
    // Asignar códigos específicos del Excel
    cuenta.codigo_clase = fila.codigo_clase || null;
    cuenta.codigo_grupo = fila.codigo_grupo || null;
    cuenta.codigo_cuenta = fila.codigo_cuenta || null;
    cuenta.codigo_subcuenta = fila.codigo_subcuenta || null;
    cuenta.codigo_detalle = fila.codigo_detalle || null;

    // Si no están definidos, derivarlos del código completo
    const codigoCompleto = cuenta.codigo_completo;
    if (codigoCompleto) {
      if (!cuenta.codigo_clase && codigoCompleto.length >= 1) {
        cuenta.codigo_clase = codigoCompleto.substring(0, 1);
      }
      if (!cuenta.codigo_grupo && codigoCompleto.length >= 2) {
        cuenta.codigo_grupo = codigoCompleto.substring(0, 2);
      }
      if (!cuenta.codigo_cuenta && codigoCompleto.length >= 4) {
        cuenta.codigo_cuenta = codigoCompleto.substring(0, 4);
      }
      if (!cuenta.codigo_subcuenta && codigoCompleto.length >= 6) {
        cuenta.codigo_subcuenta = codigoCompleto.substring(0, 6);
      }
      if (!cuenta.codigo_detalle && codigoCompleto.length >= 8) {
        cuenta.codigo_detalle = codigoCompleto;
      }
    }
  }

  private async actualizarCuentaExistente(
    cuenta: CuentaPuc,
    fila: ExcelRowPuc,
    opciones: ImportPucExcelDto
  ): Promise<CuentaPuc> {
    // Actualizar datos básicos
    cuenta.nombre = fila.descripcion || cuenta.nombre;
    
    // Actualizar saldos si se especifica
    if (opciones.importar_saldos) {
      cuenta.saldo_inicial = fila.saldo_inicial ?? cuenta.saldo_inicial;
      cuenta.saldo_final = fila.saldo_final ?? cuenta.saldo_final;
      cuenta.movimientos_debito = fila.movimientos_debito ?? cuenta.movimientos_debito;
      cuenta.movimientos_credito = fila.movimientos_credito ?? cuenta.movimientos_credito;
    }

    // Actualizar información fiscal si se especifica
    if (opciones.importar_fiscal) {
      cuenta.aplica_f350 = fila.aplica_f350 ?? cuenta.aplica_f350;
      cuenta.aplica_f300 = fila.aplica_f300 ?? cuenta.aplica_f300;
      cuenta.aplica_exogena = fila.aplica_exogena ?? cuenta.aplica_exogena;
      cuenta.aplica_ica = fila.aplica_ica ?? cuenta.aplica_ica;
      cuenta.aplica_dr110 = fila.aplica_dr110 ?? cuenta.aplica_dr110;
    }

    // Otros campos
    if (fila.centro_costos) cuenta.centro_costos = fila.centro_costos;
    if (fila.id_movimiento) cuenta.id_movimiento = fila.id_movimiento;
    if (fila.tipo_om) cuenta.tipo_om = fila.tipo_om;
    if (fila.codigo_at) cuenta.codigo_at = fila.codigo_at;
    if (fila.codigo_ct) cuenta.codigo_ct = fila.codigo_ct;
    if (fila.codigo_cc) cuenta.codigo_cc = fila.codigo_cc;
    if (fila.codigo_ti) cuenta.codigo_ti = fila.codigo_ti;
    if (fila.conciliacion_fiscal) cuenta.conciliacion_fiscal = fila.conciliacion_fiscal;

    return await this.cuentaPucRepository.save(cuenta);
  }

  private async obtenerCuentasParaExportar(opciones: ExportPucExcelDto): Promise<CuentaPuc[]> {
    const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

    // Aplicar filtros
    if (opciones.filtro_estado && opciones.filtro_estado !== 'TODAS') {
      query.andWhere('cuenta.estado = :estado', { estado: opciones.filtro_estado });
    }

    if (opciones.filtro_tipo) {
      query.andWhere('cuenta.tipo_cuenta = :tipo', { tipo: opciones.filtro_tipo });
    }

    // Ordenar por código
    query.orderBy('cuenta.codigo_completo', 'ASC');

    return await query.getMany();
  }

  private prepararDatosParaExportacion(
    cuentas: CuentaPuc[],
    opciones: ExportPucExcelDto
  ): string[][] {
    // Headers
    const headers = [
      'codigo_completo',
      'codigo_clase',
      'codigo_grupo', 
      'codigo_cuenta',
      'codigo_subcuenta',
      'codigo_detalle',
      'nombre',
      'tipo_cuenta',
      'naturaleza',
      'nivel',
      'tipo_cta',
      'codigo_padre',
      'acepta_movimientos'
    ];

    if (opciones.incluir_saldos) {
      headers.push('saldo_inicial', 'saldo_final');
    }

    if (opciones.incluir_movimientos) {
      headers.push('movimientos_debito', 'movimientos_credito');
    }

    if (opciones.incluir_fiscal) {
      headers.push('aplica_f350', 'aplica_f300', 'aplica_exogena', 'aplica_ica', 'aplica_dr110');
    }

    headers.push('centro_costos', 'id_movimiento', 'tipo_om', 'codigo_at', 'codigo_ct', 'codigo_cc', 'codigo_ti', 'conciliacion_fiscal', 'estado', 'activo');

    // Datos
    const datos: string[][] = [headers];

    cuentas.forEach(cuenta => {
      const fila: (string | number | boolean)[] = [
        cuenta.codigo_completo,
        cuenta.codigo_clase || '',
        cuenta.codigo_grupo || '',
        cuenta.codigo_cuenta || '',
        cuenta.codigo_subcuenta || '',
        cuenta.codigo_detalle || '',
        cuenta.nombre,
        cuenta.tipo_cuenta,
        cuenta.naturaleza,
        cuenta.nivel,
        cuenta.tipo_cta,
        cuenta.codigo_padre || '',
        cuenta.acepta_movimientos
      ];

      if (opciones.incluir_saldos) {
        fila.push(cuenta.saldo_inicial, cuenta.saldo_final);
      }

      if (opciones.incluir_movimientos) {
        fila.push(cuenta.movimientos_debito, cuenta.movimientos_credito);
      }

      if (opciones.incluir_fiscal) {
        fila.push(
          cuenta.aplica_f350,
          cuenta.aplica_f300,
          cuenta.aplica_exogena,
          cuenta.aplica_ica,
          cuenta.aplica_dr110
        );
      }

      fila.push(
        cuenta.centro_costos || '',
        cuenta.id_movimiento || '',
        cuenta.tipo_om || '',
        cuenta.codigo_at || '',
        cuenta.codigo_ct || '',
        cuenta.codigo_cc || '',
        cuenta.codigo_ti || '',
        cuenta.conciliacion_fiscal || '',
        cuenta.estado,
        cuenta.activo
      );

      // Convertir todos los valores a string para compatibilidad con Excel
      const filaString = fila.map(val => String(val));
      datos.push(filaString);
    });

    return datos;
  }

  private configurarFormatoWorksheet(worksheet: XLSX.WorkSheet, numColumnas: number): void {
    // Configurar ancho de columnas
    const anchosColumna = Array(numColumnas).fill(15);
    anchosColumna[0] = 12; // codigo_completo
    anchosColumna[1] = 25; // nombre

    worksheet['!cols'] = anchosColumna.map(ancho => ({ wch: ancho }));

    // Configurar rango de datos
    const range = worksheet['!ref'];
    if (range) {
      worksheet['!autofilter'] = { ref: range };
    }
  }

  private generarDatosTemplate(conEjemplos: boolean): string[][] {
    const headers = [
      'codigo_completo',
      'nombre', 
      'saldo_inicial',
      'saldo_final',
      'movimientos_debito',
      'movimientos_credito',
      'nivel',
      'tipo_cta',
      'naturaleza',
      'centro_costos',
      'id_movimiento',
      'aplica_f350',
      'aplica_f300',
      'aplica_exogena',
      'aplica_ica',
      'aplica_dr110'
    ];

    const datos: string[][] = [headers];

    if (conEjemplos) {
      const ejemplos = [
        ['1', 'ACTIVO', '0', '0', '0', '0', '1', 'G', 'DEBITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['11', 'DISPONIBLE', '0', '0', '0', '0', '2', 'G', 'DEBITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['1105', 'CAJA', '0', '0', '0', '0', '3', 'G', 'DEBITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['110505', 'CAJA GENERAL', '0', '0', '0', '0', '4', 'G', 'DEBITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['11050501', 'CAJA PRINCIPAL', '1000000', '1500000', '500000', '0', '5', 'D', 'DEBITO', 'ADMINISTRACION', 'MV001', 'false', 'false', 'false', 'false', 'false'],
        ['2', 'PASIVO', '0', '0', '0', '0', '1', 'G', 'CREDITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['21', 'OBLIGACIONES FINANCIERAS', '0', '0', '0', '0', '2', 'G', 'CREDITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['2105', 'BANCOS NACIONALES', '0', '0', '0', '0', '3', 'G', 'CREDITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['210505', 'SOBREGIROS', '0', '0', '0', '0', '4', 'G', 'CREDITO', '', '', 'false', 'false', 'false', 'false', 'false'],
        ['21050501', 'BANCO DE BOGOTA', '0', '200000', '0', '200000', '5', 'D', 'CREDITO', 'FINANCIERO', 'MV002', 'false', 'false', 'false', 'false', 'false']
      ];

      datos.push(...ejemplos);
    }

    return datos;
  }

  private generarDatosInstrucciones(): string[][] {
    return [
      ['📋 INSTRUCCIONES PARA IMPORTAR PUC'],
      [''],
      ['🔍 ESTRUCTURA DEL ARCHIVO:'],
      ['• La hoja debe llamarse "PUC" (puede cambiar el nombre en las opciones)'],
      ['• La primera fila debe contener los headers/columnas'],
      ['• Los datos deben comenzar desde la fila 2'],
      [''],
      ['📊 COLUMNAS REQUERIDAS:'],
      ['• codigo_completo: Código de la cuenta (solo números)'],
      ['• nombre: Nombre/descripción de la cuenta'],
      [''],
      ['📊 COLUMNAS OPCIONALES:'],
      ['• saldo_inicial: Saldo inicial de la cuenta'],
      ['• saldo_final: Saldo final de la cuenta'],
      ['• movimientos_debito: Total movimientos débito'],
      ['• movimientos_credito: Total movimientos crédito'],
      ['• nivel: Nivel jerárquico (1-5, se calcula automáticamente)'],
      ['• tipo_cta: Tipo cuenta (G=Grupo, D=Detalle)'],
      ['• naturaleza: DEBITO o CREDITO'],
      ['• centro_costos: Centro de costos'],
      ['• id_movimiento: ID de movimiento'],
      ['• aplica_f350: Si aplica formulario 350 (true/false)'],
      ['• aplica_f300: Si aplica formulario 300 (true/false)'],
      ['• aplica_exogena: Si aplica exógena (true/false)'],
      ['• aplica_ica: Si aplica ICA (true/false)'],
      ['• aplica_dr110: Si aplica DR110 (true/false)'],
      [''],
      ['🏗️ JERARQUÍA DE CÓDIGOS:'],
      ['• Clase: 1 dígito (Ej: 1, 2, 3, 4, 5)'],
      ['• Grupo: 2 dígitos (Ej: 11, 21, 31)'],
      ['• Cuenta: 4 dígitos (Ej: 1105, 2105)'],
      ['• Subcuenta: 6 dígitos (Ej: 110505, 210505)'],
      ['• Detalle: 8 dígitos (Ej: 11050501, 21050501)'],
      [''],
      ['⚠️ VALIDACIONES:'],
      ['• Los códigos deben tener 1, 2, 4, 6 u 8 dígitos'],
      ['• Los códigos deben contener solo números'],
      ['• Se debe respetar la jerarquía (crear padres antes que hijos)'],
      ['• Los nombres son obligatorios'],
      [''],
      ['🔄 OPCIONES DE IMPORTACIÓN:'],
      ['• Sobreescribir: Actualizar cuentas existentes'],
      ['• Validar jerarquía: Verificar estructura antes de importar'],
      ['• Importar saldos: Incluir información de saldos'],
      ['• Importar fiscal: Incluir información fiscal'],
      [''],
      ['💡 CONSEJOS:'],
      ['• Ordenar los datos por código antes de importar'],
      ['• Verificar que no haya códigos duplicados'],
      ['• Usar el validador antes de importar definitivamente'],
      ['• Hacer respaldo de la base de datos antes de importar'],
      [''],
      ['🔧 FORMATOS SOPORTADOS:'],
      ['• Números: 1000, 1000.50, 1,000.50'],
      ['• Booleanos: true/false, 1/0, si/no, yes/no'],
      ['• Texto: cualquier cadena de texto'],
      ['• Códigos: solo números (se limpia automáticamente)']
    ];
  }

  // ===============================================
  // 🔧 MÉTODOS UTILITARIOS
  // ===============================================

  private limpiarCodigo(valor: unknown): string {
    if (valor === null || valor === undefined) return '';
    
    // Convertir a string y limpiar
    let codigo = valor.toString().trim();
    
    // Remover puntos, comas, espacios y otros caracteres no numéricos
    codigo = codigo.replace(/[^\d]/g, '');
    
    return codigo;
  }

  private parseNumero(valor: unknown): number {
    if (valor === null || valor === undefined || valor === '') return 0;
    
    // Si ya es un número
    if (typeof valor === 'number') return valor;
    
    // Convertir string a número
    const numeroStr = valor.toString()
      .replace(/[^\d.-]/g, '') // Mantener solo dígitos, punto y guión
      .replace(/,/g, ''); // Remover comas
    
    const numero = parseFloat(numeroStr);
    
    return isNaN(numero) ? 0 : numero;
  }

  private parseBoolean(valor: unknown): boolean {
    if (valor === null || valor === undefined || valor === '') return false;
    if (typeof valor === 'boolean') return valor;
    if (typeof valor === 'number') return valor === 1;
    
    const str = valor.toString().toLowerCase().trim();
    return ['true', '1', 'si', 'sí', 'yes', 'verdadero', 'x', 'on'].includes(str);
  }

  private calcularNivelPorCodigo(codigo: string): number {
    const longitud = codigo.length;
    
    switch (longitud) {
      case 1: return 1; // Clase
      case 2: return 2; // Grupo
      case 4: return 3; // Cuenta
      case 6: return 4; // Subcuenta
      case 8: return 5; // Detalle
      default: return 1;
    }
  }

  private determinarTipoCuenta(codigo: string): TipoCuentaEnum {
    const longitud = codigo.length;
    
    switch (longitud) {
      case 1: return TipoCuentaEnum.CLASE;
      case 2: return TipoCuentaEnum.GRUPO;
      case 4: return TipoCuentaEnum.CUENTA;
      case 6: return TipoCuentaEnum.SUBCUENTA;
      case 8: return TipoCuentaEnum.DETALLE;
      default: return TipoCuentaEnum.CUENTA;
    }
  }

  private calcularCodigoPadre(codigo: string): string | null {
    const longitud = codigo.length;
    
    if (longitud <= 1) return null;
    
    switch (longitud) {
      case 2: return codigo.substring(0, 1); // Grupo -> Clase
      case 4: return codigo.substring(0, 2); // Cuenta -> Grupo
      case 6: return codigo.substring(0, 4); // Subcuenta -> Cuenta
      case 8: return codigo.substring(0, 6); // Detalle -> Subcuenta
      default: return null;
    }
  }

  private determinarNaturaleza(naturalezaExcel: string | undefined, codigo: string): NaturalezaCuentaEnum {
    if (naturalezaExcel) {
      const naturaleza = naturalezaExcel.toUpperCase().trim();
      if (['CREDITO', 'CRÉDITO', 'C', 'CR'].includes(naturaleza)) {
        return NaturalezaCuentaEnum.CREDITO;
      }
      if (['DEBITO', 'DÉBITO', 'D', 'DB'].includes(naturaleza)) {
        return NaturalezaCuentaEnum.DEBITO;
      }
    }

    // Determinar por código si no se especifica (según PUC colombiano)
    const primeraClase = codigo.charAt(0);
    
    switch (primeraClase) {
      case '1': // Activos
      case '5': // Gastos
      case '6': // Costos de ventas
      case '7': // Costos de producción o de operación
        return NaturalezaCuentaEnum.DEBITO;
      
      case '2': // Pasivos
      case '3': // Patrimonio
      case '4': // Ingresos
        return NaturalezaCuentaEnum.CREDITO;
      
      case '8': // Cuentas de orden deudoras
        return NaturalezaCuentaEnum.DEBITO;
      
      case '9': // Cuentas de orden acreedoras
        return NaturalezaCuentaEnum.CREDITO;
      
      default:
        return NaturalezaCuentaEnum.DEBITO;
    }
  }
}
