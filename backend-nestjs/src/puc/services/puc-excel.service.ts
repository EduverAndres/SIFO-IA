// backend-nestjs/src/puc/services/puc-excel.service.ts - SERVICIO COMPLETO CORREGIDO
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

// Mapeo de columnas basado en la estructura del Excel analizada
interface ExcelColumnMapping {
  saldo_inicial: number;      // Columna 0
  saldo_final: number;        // Columna 1  
  codigo_clase: number;       // Columna 2
  codigo_grupo: number;       // Columna 3
  codigo_cuenta: number;      // Columna 4
  codigo_subcuenta: number;   // Columna 5
  codigo_detalle: number;     // Columna 6
  id_movimiento: number;      // Columna 7 (I.D.)
  nombre: number;             // Columna 8 (DESCRIPCION)
  tipo_om: number;            // Columna 9 (TC$/OM)
  centro_costos: number;      // Columna 10
  movimientos_debito: number; // Columna 11
  movimientos_credito: number;// Columna 12
  tipo_cta: number;           // Columna 13 (Tipo/Cta)
  nivel: number;              // Columna 14 (NL)
  codigo_at: number;          // Columna 15 (AT)
  codigo_ct: number;          // Columna 16 (CT)
  codigo_cc: number;          // Columna 17 (CC)
  codigo_ti: number;          // Columna 18 (TI)
  aplica_f350: number;        // Columna 19 (F350)
  aplica_f300: number;        // Columna 20 (F300)
  aplica_exogena: number;     // Columna 21 (Exogena)
  aplica_ica: number;         // Columna 22 (ICA)
  aplica_dr110: number;       // Columna 23 (DR110)
  conciliacion_fiscal: number;// Columna 24 (Conciliacion Fiscal)
}

interface FilaProcesada {
  codigo_completo: string;
  nombre: string;
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

  private readonly COLUMN_MAPPING: ExcelColumnMapping = {
    saldo_inicial: 0,
    saldo_final: 1,
    codigo_clase: 2,
    codigo_grupo: 3,
    codigo_cuenta: 4,
    codigo_subcuenta: 5,
    codigo_detalle: 6,
    id_movimiento: 7,
    nombre: 8,
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

      // 3. Procesar datos del Excel
      const worksheet = workbook.Sheets[nombreHoja];
      const datosExcel = this.procesarHojaExcel(worksheet, opciones);
      
      // 4. Validar datos
      const validacion = this.validarDatos(datosExcel, opciones);
      if (!validacion.es_valido) {
        return {
          exito: false,
          mensaje: 'El archivo contiene errores de validación',
          resumen: {
            total_procesadas: datosExcel.length,
            insertadas: 0,
            actualizadas: 0,
            errores: validacion.errores.length,
            omitidas: 0
          },
          errores: validacion.errores.map((error, index) => ({
            fila: index + 1,
            error: error
          })),
          advertencias: validacion.advertencias
        };
      }

      // 5. Procesar importación
      const resultado = await this.procesarImportacion(datosExcel, opciones);
      
      this.logger.log(`✅ Importación completada: ${resultado.resumen.insertadas} insertadas, ${resultado.resumen.actualizadas} actualizadas`);
      
      return resultado;

    } catch (error) {
      this.logger.error(`❌ Error en importación: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al procesar archivo: ${error.message}`);
    }
  }

  async validarArchivoExcel(file: Express.Multer.File, hoja: string = 'PUC'): Promise<ValidacionExcel> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      
      if (!workbook.SheetNames.includes(hoja)) {
        return {
          es_valido: false,
          errores: [`No se encontró la hoja "${hoja}" en el archivo`],
          advertencias: [],
          total_filas: 0
        };
      }

      const worksheet = workbook.Sheets[hoja];
      const datosExcel = this.procesarHojaExcel(worksheet, { hoja });
      
      return this.validarDatos(datosExcel, { hoja });
      
    } catch (error) {
      return {
        es_valido: false,
        errores: [`Error al procesar archivo: ${error.message}`],
        advertencias: [],
        total_filas: 0
      };
    }
  }

  // ===============================================
  // 🔧 PROCESAMIENTO DE DATOS
  // ===============================================

  private procesarHojaExcel(worksheet: XLSX.WorkSheet, opciones: Partial<ImportPucExcelDto>): FilaProcesada[] {
    // Convertir hoja a array bidimensional
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      defval: ''
    }) as string[][];

    // Verificar que hay datos
    if (rawData.length < 3) {
      throw new Error('El archivo debe tener al menos 3 filas (2 de headers + 1 de datos)');
    }

    const filaInicio = opciones.fila_inicio || 3; // Empezar desde fila 3 (después de los 2 headers)
    const datosExcel: FilaProcesada[] = [];

    // Procesar cada fila de datos
    for (let i = filaInicio - 1; i < rawData.length; i++) {
      const fila = rawData[i];
      
      // Saltar filas vacías
      if (!fila || fila.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }

      try {
        const filaProcesada = this.procesarFilaExcel(fila, i + 1, opciones);
        if (filaProcesada) {
          datosExcel.push(filaProcesada);
        }
      } catch (error) {
        this.logger.warn(`Error procesando fila ${i + 1}: ${error.message}`);
        // Continuar con la siguiente fila
      }
    }

    return datosExcel;
  }

  private procesarFilaExcel(fila: string[], numeroFila: number, opciones: Partial<ImportPucExcelDto>): FilaProcesada | null {
    // Construir código completo basado en la estructura jerárquica
    const codigoCompleto = this.construirCodigoCompleto(fila);
    
    if (!codigoCompleto) {
      return null; // Saltar filas sin código
    }

    const nombre = this.obtenerValorCelda(fila, this.COLUMN_MAPPING.nombre);
    if (!nombre) {
      return null; // Saltar filas sin nombre
    }

    // Determinar nivel y tipo de cuenta
    const nivel = this.determinarNivel(codigoCompleto);
    const tipoCta = this.obtenerValorCelda(fila, this.COLUMN_MAPPING.tipo_cta) || (nivel === 5 ? 'D' : 'G');
    const naturaleza = this.determinarNaturaleza(codigoCompleto);
    const tipoCuenta = nivel === 5 ? TipoCuentaEnum.DETALLE : TipoCuentaEnum.MADRE;
    const codigoPadre = this.determinarCodigoPadre(codigoCompleto);

    return {
      codigo_completo: codigoCompleto,
      nombre: nombre,
      codigo_clase: this.extraerCodigoClase(codigoCompleto),
      codigo_grupo: this.extraerCodigoGrupo(codigoCompleto),
      codigo_cuenta: this.extraerCodigoCuenta(codigoCompleto),
      codigo_subcuenta: this.extraerCodigoSubcuenta(codigoCompleto),
      codigo_detalle: this.extraerCodigoDetalle(codigoCompleto),
      nivel: nivel,
      tipo_cta: tipoCta,
      naturaleza: naturaleza,
      tipo_cuenta: tipoCuenta,
      codigo_padre: codigoPadre,
      acepta_movimientos: nivel === 5, // Solo detalles aceptan movimientos
      saldo_inicial: opciones.importar_saldos ? this.parseNumero(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.saldo_inicial)) : 0,
      saldo_final: opciones.importar_saldos ? this.parseNumero(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.saldo_final)) : 0,
      movimientos_debito: opciones.importar_saldos ? this.parseNumero(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.movimientos_debito)) : 0,
      movimientos_credito: opciones.importar_saldos ? this.parseNumero(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.movimientos_credito)) : 0,
      centro_costos: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.centro_costos)),
      id_movimiento: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.id_movimiento)),
      tipo_om: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.tipo_om)),
      codigo_at: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_at)),
      codigo_ct: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_ct)),
      codigo_cc: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_cc)),
      codigo_ti: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_ti)),
      aplica_f350: opciones.importar_fiscal ? this.parseBooleano(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.aplica_f350)) : false,
      aplica_f300: opciones.importar_fiscal ? this.parseBooleano(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.aplica_f300)) : false,
      aplica_exogena: opciones.importar_fiscal ? this.parseBooleano(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.aplica_exogena)) : false,
      aplica_ica: opciones.importar_fiscal ? this.parseBooleano(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.aplica_ica)) : false,
      aplica_dr110: opciones.importar_fiscal ? this.parseBooleano(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.aplica_dr110)) : false,
      conciliacion_fiscal: this.toNullIfEmpty(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.conciliacion_fiscal)),
      fila_excel: numeroFila
    };
  }

  private construirCodigoCompleto(fila: string[]): string {
    // Obtener códigos de las columnas jerárquicas
    const clase = this.limpiarCodigo(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_clase));
    const grupo = this.limpiarCodigo(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_grupo));
    const cuenta = this.limpiarCodigo(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_cuenta));
    const subcuenta = this.limpiarCodigo(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_subcuenta));
    const detalle = this.limpiarCodigo(this.obtenerValorCelda(fila, this.COLUMN_MAPPING.codigo_detalle));

    // Determinar el código completo basado en qué campos están llenos
    if (detalle) return detalle;
    if (subcuenta) return subcuenta;
    if (cuenta) return cuenta;
    if (grupo) return grupo;
    if (clase) return clase;
    
    return '';
  }

  private obtenerValorCelda(fila: string[], indice: number): string {
    if (indice >= fila.length) return '';
    const valor = fila[indice];
    return valor ? valor.toString().trim() : '';
  }

  // ===============================================
  // 🔍 VALIDACIONES
  // ===============================================

  private validarDatos(datos: FilaProcesada[], opciones: Partial<ImportPucExcelDto>): ValidacionExcel {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const codigosVistos = new Set<string>();

    for (const fila of datos) {
      const prefijoError = `Fila ${fila.fila_excel}:`;

      // Validar código único
      if (codigosVistos.has(fila.codigo_completo)) {
        errores.push(`${prefijoError} Código duplicado: ${fila.codigo_completo}`);
      }
      codigosVistos.add(fila.codigo_completo);

      // Validar formato de código
      if (!this.validarFormatoCodigo(fila.codigo_completo)) {
        errores.push(`${prefijoError} Código inválido: ${fila.codigo_completo}`);
      }

      // Validar nombre
      if (!fila.nombre || fila.nombre.length === 0) {
        errores.push(`${prefijoError} Nombre es obligatorio`);
      }

      // Validar longitud del nombre
      if (fila.nombre && fila.nombre.length > 500) {
        errores.push(`${prefijoError} Nombre excede 500 caracteres`);
      }

      // Validar jerarquía si está habilitada
      if (opciones.validar_jerarquia) {
        const errorJerarquia = this.validarJerarquia(fila, datos);
        if (errorJerarquia) {
          errores.push(`${prefijoError} ${errorJerarquia}`);
        }
      }

      // Validaciones de saldos
      if (opciones.importar_saldos) {
        if (fila.saldo_inicial < 0 || fila.saldo_final < 0) {
          advertencias.push(`${prefijoError} Saldos negativos detectados`);
        }
      }
    }

    return {
      es_valido: errores.length === 0,
      errores: errores,
      advertencias: advertencias,
      total_filas: datos.length
    };
  }

  private validarFormatoCodigo(codigo: string): boolean {
    // Debe ser numérico y tener longitud válida (1, 2, 4, 6, 8 dígitos)
    if (!/^\d+$/.test(codigo)) return false;
    
    const longitudes = [1, 2, 4, 6, 8];
    return longitudes.includes(codigo.length);
  }

  private validarJerarquia(fila: FilaProcesada, todosDatos: FilaProcesada[]): string | null {
    // Si no tiene padre, no hay que validar
    if (!fila.codigo_padre) return null;

    // Buscar el padre en los datos
    const padre = todosDatos.find(d => d.codigo_completo === fila.codigo_padre);
    if (!padre) {
      return `Cuenta padre ${fila.codigo_padre} no encontrada`;
    }

    // Validar que el nivel sea correcto
    if (fila.nivel !== padre.nivel + 1) {
      return `Nivel incorrecto. Debería ser ${padre.nivel + 1}`;
    }

    return null;
  }

  // ===============================================
  // 💾 PROCESAMIENTO DE IMPORTACIÓN
  // ===============================================

  private async procesarImportacion(datos: FilaProcesada[], opciones: ImportPucExcelDto): Promise<ResultadoImportacion> {
    const resultado: ResultadoImportacion = {
      exito: true,
      mensaje: 'Importación completada exitosamente',
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

    // Ordenar datos por nivel para procesar padres antes que hijos
    datos.sort((a, b) => a.nivel - b.nivel || a.codigo_completo.localeCompare(b.codigo_completo));

    for (const fila of datos) {
      try {
        const cuentaExistente = await this.cuentaPucRepository.findOne({
          where: { codigo_completo: fila.codigo_completo }
        });

        if (cuentaExistente) {
          if (opciones.sobreescribir) {
            await this.actualizarCuenta(cuentaExistente, fila);
            resultado.resumen.actualizadas++;
          } else {
            resultado.resumen.omitidas++;
            resultado.advertencias.push(`Fila ${fila.fila_excel}: Cuenta ${fila.codigo_completo} ya existe (omitida)`);
          }
        } else {
          await this.crearCuenta(fila);
          resultado.resumen.insertadas++;
        }
      } catch (error) {
        resultado.resumen.errores++;
        resultado.errores.push({
          fila: fila.fila_excel,
          error: `Error al procesar cuenta ${fila.codigo_completo}: ${error.message}`
        });
      }
    }

    return resultado;
  }

  private async crearCuenta(fila: FilaProcesada): Promise<CuentaPuc> {
    const cuenta = this.cuentaPucRepository.create({
      codigo_clase: fila.codigo_clase,
      codigo_grupo: fila.codigo_grupo,
      codigo_cuenta: fila.codigo_cuenta,
      codigo_subcuenta: fila.codigo_subcuenta,
      codigo_detalle: fila.codigo_detalle,
      codigo_completo: fila.codigo_completo,
      nombre: fila.nombre,
      tipo_cuenta: fila.tipo_cuenta,
      naturaleza: fila.naturaleza,
      estado: EstadoCuentaEnum.ACTIVA,
      nivel: fila.nivel,
      tipo_cta: fila.tipo_cta,
      codigo_padre: fila.codigo_padre,
      acepta_movimientos: fila.acepta_movimientos,
      saldo_inicial: fila.saldo_inicial,
      saldo_final: fila.saldo_final,
      movimientos_debito: fila.movimientos_debito,
      movimientos_credito: fila.movimientos_credito,
      centro_costos: fila.centro_costos,
      id_movimiento: fila.id_movimiento,
      tipo_om: fila.tipo_om,
      codigo_at: fila.codigo_at,
      codigo_ct: fila.codigo_ct,
      codigo_cc: fila.codigo_cc,
      codigo_ti: fila.codigo_ti,
      aplica_f350: fila.aplica_f350,
      aplica_f300: fila.aplica_f300,
      aplica_exogena: fila.aplica_exogena,
      aplica_ica: fila.aplica_ica,
      aplica_dr110: fila.aplica_dr110,
      conciliacion_fiscal: fila.conciliacion_fiscal,
      activo: true
    });

    return await this.cuentaPucRepository.save(cuenta);
  }

  private async actualizarCuenta(cuenta: CuentaPuc, fila: FilaProcesada): Promise<CuentaPuc> {
    // Actualizar campos - convertir undefined a null explícitamente
    cuenta.nombre = fila.nombre;
    cuenta.saldo_inicial = fila.saldo_inicial;
    cuenta.saldo_final = fila.saldo_final;
    cuenta.movimientos_debito = fila.movimientos_debito;
    cuenta.movimientos_credito = fila.movimientos_credito;
    cuenta.centro_costos = fila.centro_costos;
    cuenta.id_movimiento = fila.id_movimiento;
    cuenta.tipo_om = fila.tipo_om;
    cuenta.codigo_at = fila.codigo_at;
    cuenta.codigo_ct = fila.codigo_ct;
    cuenta.codigo_cc = fila.codigo_cc;
    cuenta.codigo_ti = fila.codigo_ti;
    cuenta.aplica_f350 = fila.aplica_f350;
    cuenta.aplica_f300 = fila.aplica_f300;
    cuenta.aplica_exogena = fila.aplica_exogena;
    cuenta.aplica_ica = fila.aplica_ica;
    cuenta.aplica_dr110 = fila.aplica_dr110;
    cuenta.conciliacion_fiscal = fila.conciliacion_fiscal;
    cuenta.fecha_modificacion = new Date();

    return await this.cuentaPucRepository.save(cuenta);
  }

  // ===============================================
  // 🔧 MÉTODOS UTILITARIOS
  // ===============================================

  private limpiarCodigo(valor: string): string {
    if (!valor) return '';
    return valor.replace(/[^\d]/g, '');
  }

  private parseNumero(valor: string): number {
    if (!valor) return 0;
    const numero = parseFloat(valor.replace(/[^\d.-]/g, '').replace(/,/g, ''));
    return isNaN(numero) ? 0 : numero;
  }

  private parseBooleano(valor: string): boolean {
    if (!valor) return false;
    const valorLimpio = valor.toString().toLowerCase().trim();
    return ['true', '1', 'si', 'yes', 'x'].includes(valorLimpio);
  }

  // Método auxiliar para convertir strings vacíos a null
  private toNullIfEmpty(valor: string): string | null {
    return valor && valor.trim() !== '' ? valor : null;
  }

  private determinarNivel(codigo: string): number {
    const longitud = codigo.length;
    if (longitud === 1) return 1; // Clase
    if (longitud === 2) return 2; // Grupo
    if (longitud === 4) return 3; // Cuenta
    if (longitud === 6) return 4; // Subcuenta
    if (longitud >= 8) return 5; // Detalle
    return 1;
  }

  private determinarNaturaleza(codigo: string): NaturalezaCuentaEnum {
    const clase = codigo.charAt(0);
    // Clases 1, 5, 6, 7, 8 son de naturaleza DEBITO
    // Clases 2, 3, 4, 9 son de naturaleza CREDITO
    return ['1', '5', '6', '7', '8'].includes(clase) 
      ? NaturalezaCuentaEnum.DEBITO 
      : NaturalezaCuentaEnum.CREDITO;
  }

  private determinarCodigoPadre(codigo: string): string | null {
    if (codigo.length <= 1) return null;
    
    // Determinar el código del padre según la longitud
    if (codigo.length === 2) return codigo.substring(0, 1);      // Grupo -> Clase
    if (codigo.length === 4) return codigo.substring(0, 2);      // Cuenta -> Grupo
    if (codigo.length === 6) return codigo.substring(0, 4);      // Subcuenta -> Cuenta
    if (codigo.length >= 8) return codigo.substring(0, 6);       // Detalle -> Subcuenta
    
    return null;
  }

  private extraerCodigoClase(codigo: string): string | null {
    return codigo.length >= 1 ? codigo.substring(0, 1) : null;
  }

  private extraerCodigoGrupo(codigo: string): string | null {
    return codigo.length >= 2 ? codigo.substring(0, 2) : null;
  }

  private extraerCodigoCuenta(codigo: string): string | null {
    return codigo.length >= 4 ? codigo.substring(0, 4) : null;
  }

  private extraerCodigoSubcuenta(codigo: string): string | null {
    return codigo.length >= 6 ? codigo.substring(0, 6) : null;
  }

  private extraerCodigoDetalle(codigo: string): string | null {
    return codigo.length >= 8 ? codigo : null;
  }

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN
  // ===============================================

  async exportarAExcel(opciones: ExportPucExcelDto): Promise<Buffer> {
    this.logger.log(`🔄 Iniciando exportación con filtros: ${JSON.stringify(opciones)}`);
    
    try {
      // 1. Construir query con filtros
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');
      
      // 🚀 CORRECCIÓN APLICADA: Verificar que sea un valor válido del enum
      if (opciones.filtro_estado && 
          Object.values(EstadoCuentaEnum).includes(opciones.filtro_estado as EstadoCuentaEnum)) {
        query.andWhere('cuenta.estado = :estado', { estado: opciones.filtro_estado });
      }

      if (opciones.filtro_tipo) {
        query.andWhere('cuenta.tipo_cuenta = :tipo', { tipo: opciones.filtro_tipo });
      }

      if (opciones.filtro_clase) {
        query.andWhere('cuenta.codigo_clase = :clase', { clase: opciones.filtro_clase });
      }

      if (opciones.solo_movimientos) {
        query.andWhere('cuenta.acepta_movimientos = :acepta', { acepta: true });
      }

      if (!opciones.incluir_inactivas) {
        query.andWhere('cuenta.activo = :activo', { activo: true });
      }

      // Ordenar jerárquicamente
      query.orderBy('cuenta.codigo_completo', 'ASC');

      const cuentas = await query.getMany();
      
      this.logger.log(`📊 Se exportarán ${cuentas.length} cuentas`);

      // 2. Generar datos Excel manteniendo formato original
      const datos = this.generarDatosTemplate(false); // Headers sin ejemplos
      const cols = datos[0].length;

      // 3. Procesar cada cuenta
      for (const cuenta of cuentas) {
        const fila = Array(cols).fill('');

        // SALDOS (Columnas A, B) - Solo si está habilitado
        if (opciones.incluir_saldos) {
          fila[this.COLUMN_MAPPING.saldo_inicial] = (cuenta.saldo_inicial ?? 0).toString();
          fila[this.COLUMN_MAPPING.saldo_final] = (cuenta.saldo_final ?? 0).toString();
        }

        // JERARQUÍA - Determinar en qué columna va según el nivel
        this.establecerJerarquiaExportacion(fila, cuenta);

        // CAMPOS BÁSICOS
        fila[this.COLUMN_MAPPING.id_movimiento] = cuenta.acepta_movimientos ? 'X' : '';
        fila[this.COLUMN_MAPPING.nombre] = cuenta.nombre;
        fila[this.COLUMN_MAPPING.tipo_om] = cuenta.tipo_om || '';
        fila[this.COLUMN_MAPPING.centro_costos] = cuenta.centro_costos || '';
        fila[this.COLUMN_MAPPING.tipo_cta] = cuenta.acepta_movimientos ? 'D' : 'G';
        fila[this.COLUMN_MAPPING.nivel] = cuenta.nivel.toString();

        // CÓDIGOS ADICIONALES
        fila[this.COLUMN_MAPPING.codigo_at] = cuenta.codigo_at || '';
        fila[this.COLUMN_MAPPING.codigo_ct] = cuenta.codigo_ct || '';
        fila[this.COLUMN_MAPPING.codigo_cc] = cuenta.codigo_cc || '';
        fila[this.COLUMN_MAPPING.codigo_ti] = cuenta.codigo_ti || '';

        // MOVIMIENTOS - Solo si está habilitado
        if (opciones.incluir_movimientos) {
          fila[this.COLUMN_MAPPING.movimientos_debito] = (cuenta.movimientos_debito ?? 0).toString();
          fila[this.COLUMN_MAPPING.movimientos_credito] = (cuenta.movimientos_credito ?? 0).toString();
        }

        // DATOS FISCALES - Solo si está habilitado
        if (opciones.incluir_fiscal) {
          fila[this.COLUMN_MAPPING.aplica_f350] = cuenta.aplica_f350 ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_f300] = cuenta.aplica_f300 ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_exogena] = cuenta.aplica_exogena ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_ica] = cuenta.aplica_ica ? 'X' : '';
          fila[this.COLUMN_MAPPING.aplica_dr110] = cuenta.aplica_dr110 ? 'X' : '';
          fila[this.COLUMN_MAPPING.conciliacion_fiscal] = cuenta.conciliacion_fiscal || '';
        }

        datos.push(fila);
      }

      // 4. Crear workbook y devolver buffer
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(datos, { dateNF: 'yyyy-mm-dd' });
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PUC');

      this.logger.log(`✅ Exportación completada: ${cuentas.length} cuentas exportadas`);

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    } catch (error) {
      this.logger.error(`❌ Error en exportación: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al exportar PUC: ${error.message}`);
    }
  }

  private establecerJerarquiaExportacion(fila: string[], cuenta: CuentaPuc): void {
    // Limpiar todas las columnas de jerarquía primero
    fila[this.COLUMN_MAPPING.codigo_clase] = '';
    fila[this.COLUMN_MAPPING.codigo_grupo] = '';
    fila[this.COLUMN_MAPPING.codigo_cuenta] = '';
    fila[this.COLUMN_MAPPING.codigo_subcuenta] = '';
    fila[this.COLUMN_MAPPING.codigo_detalle] = '';

    // Establecer valor en la columna correspondiente al nivel
    switch (cuenta.nivel) {
      case 1: // Clase
        fila[this.COLUMN_MAPPING.codigo_clase] = cuenta.codigo_completo;
        break;
      case 2: // Grupo
        fila[this.COLUMN_MAPPING.codigo_grupo] = cuenta.codigo_completo;
        break;
      case 3: // Cuenta
        fila[this.COLUMN_MAPPING.codigo_cuenta] = cuenta.codigo_completo;
        break;
      case 4: // Subcuenta
        fila[this.COLUMN_MAPPING.codigo_subcuenta] = cuenta.codigo_completo;
        break;
      case 5: // Detalle
        fila[this.COLUMN_MAPPING.codigo_detalle] = cuenta.codigo_completo;
        break;
    }
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

  private generarDatosTemplate(conEjemplos: boolean): string[][] {
    const headers1 = [
      '', '', 'CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'DETALLE', 'I. D.', 'DESCRIPCION', 'TC$/OM', 
      'Centro de Costos', 'Movimientos', '', 'Tipo', '', '', '', '', '', 'Informacion Fiscal', 
      '', '', '', '', 'UVT $49,799', '', ''
    ];

    const headers2 = [
      'SALDO INICIAL', 'SALDO FINAL', 'C (1)', 'CGG (2)', 'CGUU(3)', 'CGUUSS(4)', 'CGGUUSSDD(5)', 
      '', '', 'OM', '', 'Debitos', 'Creditos', 'Cta', 'NL', 'AT', 'CT', 'CC', 'TI', 'F350', 
      'F300', 'Exogena', 'ICA', 'DR(110)', 'Conciliacion Fiscal', '', ''
    ];

    const datos = [headers1, headers2];

    if (conEjemplos) {
      const ejemplos = [
        ['21864301859.74', '', '1', '', '', '', '', '', 'ACTIVOS', '', '', '', '', 'G', '1', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['1912615578.68', '', '', '11', '', '', '', '', 'EFECTIVO Y EQUIVALENTES AL EFECTIVO', '', '', '', '', 'G', '2', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['17130522.90', '', '', '', '1105', '', '', '', 'CAJA', '', '', '', '', 'G', '3', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['15630522.90', '', '', '', '', '110501', '', 'X', 'Caja principal', '', 'N / A', '', '', 'D', '4', 'X', 'X', '', '', '', '', '', '', '36', 'H2 (ESF - Patrimonio)', '12', ''],
        ['1500000.00', '', '', '', '', '110502', '', 'X', 'Caja menor', '', '000 00000', '', '', 'D', '4', 'X', '', '', '', '', '', '', '', '36', 'H2 (ESF - Patrimonio)', '12', '']
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
      ['• Las primeras 2 filas contienen los headers/columnas'],
      ['• Los datos deben comenzar desde la fila 3'],
      [''],
      ['📊 COLUMNAS PRINCIPALES:'],
      ['• CLASE (Col C): Código de clase (1 dígito)'],
      ['• GRUPO (Col D): Código de grupo (2 dígitos)'],
      ['• CUENTA (Col E): Código de cuenta (4 dígitos)'],
      ['• SUBCUENTA (Col F): Código de subcuenta (6 dígitos)'],
      ['• DETALLE (Col G): Código de detalle (8+ dígitos)'],
      ['• DESCRIPCION (Col I): Nombre de la cuenta (obligatorio)'],
      [''],
      ['📊 COLUMNAS DE SALDOS:'],
      ['• SALDO INICIAL (Col A): Saldo inicial de la cuenta'],
      ['• SALDO FINAL (Col B): Saldo final de la cuenta'],
      ['• Debitos (Col L): Total movimientos débito'],
      ['• Creditos (Col M): Total movimientos crédito'],
      [''],
      ['📊 COLUMNAS DE CONTROL:'],
      ['• I.D. (Col H): Identificador de movimiento'],
      ['• OM (Col J): Tipo de operación/movimiento'],
      ['• Centro de Costos (Col K): Centro de costos'],
      ['• Cta (Col N): Tipo de cuenta (G=Grupo, D=Detalle)'],
      ['• NL (Col O): Nivel jerárquico (se calcula automáticamente)'],
      [''],
      ['📊 COLUMNAS FISCALES:'],
      ['• F350 (Col T): Aplica formulario 350 (true/false)'],
      ['• F300 (Col U): Aplica formulario 300 (true/false)'],
      ['• Exogena (Col V): Aplica exógena (true/false)'],
      ['• ICA (Col W): Aplica ICA (true/false)'],
      ['• DR(110) (Col X): Aplica DR110 (true/false)'],
      ['• Conciliacion Fiscal (Col Y): Información de conciliación'],
      [''],
      ['📊 COLUMNAS ADICIONALES:'],
      ['• AT (Col P): Código AT'],
      ['• CT (Col Q): Código CT'],
      ['• CC (Col R): Código CC'],
      ['• TI (Col S): Código TI'],
      [''],
      ['🏗️ JERARQUÍA DE CÓDIGOS:'],
      ['• Clase: 1 dígito (Ej: 1, 2, 3, 4, 5)'],
      ['• Grupo: 2 dígitos (Ej: 11, 21, 31)'],
      ['• Cuenta: 4 dígitos (Ej: 1105, 2105)'],
      ['• Subcuenta: 6 dígitos (Ej: 110505, 210505)'],
      ['• Detalle: 8+ dígitos (Ej: 11050501, 21050501)'],
      [''],
      ['⚠️ VALIDACIONES:'],
      ['• Los códigos deben tener 1, 2, 4, 6 u 8+ dígitos'],
      ['• Los códigos deben contener solo números'],
      ['• Se debe respetar la jerarquía (crear padres antes que hijos)'],
      ['• Los nombres son obligatorios'],
      ['• Máximo 500 caracteres para nombres'],
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
      ['• Solo llenar UNA columna de código por fila (la del nivel correspondiente)'],
      [''],
      ['🔧 FORMATOS SOPORTADOS:'],
      ['• Números: 1000, 1000.50, 1,000.50'],
      ['• Booleanos: true/false, 1/0, si/no, yes/no, X'],
      ['• Texto: cualquier cadena de texto'],
      ['• Códigos: solo números (se limpia automáticamente)'],
      [''],
      ['📝 NATURALEZA DE CUENTAS (automática):'],
      ['• DEBITO: Clases 1, 5, 6, 7, 8 (Activos, Gastos, Costos)'],
      ['• CREDITO: Clases 2, 3, 4, 9 (Pasivos, Patrimonio, Ingresos)'],
      [''],
      ['🎯 EJEMPLO DE JERARQUÍA:'],
      ['• Fila 1: Clase "1" = ACTIVOS'],
      ['• Fila 2: Grupo "11" = EFECTIVO Y EQUIVALENTES'],
      ['• Fila 3: Cuenta "1105" = CAJA'],
      ['• Fila 4: Subcuenta "110501" = Caja principal'],
      ['• Fila 5: Detalle "11050101" = Caja principal sucursal A']
    ];
  }
}
