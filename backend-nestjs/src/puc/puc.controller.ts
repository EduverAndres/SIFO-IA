// backend-nestjs/src/puc/puc.controller.ts - VERSIÓN COMPLETA Y CORREGIDA
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  DefaultValuePipe,
  Logger,
  HttpException,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiProduces
} from '@nestjs/swagger';

import { PucService } from './puc.service';
import { PucExcelService } from './services/puc-excel.service';
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';
import { ImportPucExcelDto } from './dto/import-puc-excel.dto';
import { ExportPucExcelDto } from './dto/export-puc-excel.dto';
import { ValidarExcelDto } from './dto/validar-excel.dto';
import { ResultadoImportacionDto } from './dto/resultado-importacion.dto';
import { ResultadoValidacionDto } from './dto/resultado-validacion.dto';
import { ResponsePucDto } from './dto/response-puc.dto';
import { Express } from 'express';

@ApiTags('🏛️ PUC (Plan Único de Cuentas)')
@Controller('puc')
export class PucController {
  private readonly logger = new Logger(PucController.name);

  constructor(
    private readonly pucService: PucService,
    private readonly pucExcelService: PucExcelService
  ) {
    this.logger.log('🎯 PucController inicializado - rutas disponibles en /api/v1/puc');
  }

  // ===============================================
  // 🔧 ENDPOINTS DE UTILIDAD
  // ===============================================

  @Get('test')
  @ApiOperation({ summary: 'Endpoint de prueba del controlador PUC' })
  @ApiResponse({ status: 200, description: 'Controlador funcionando correctamente' })
  test(): { success: boolean; message: string; timestamp: string; rutas_disponibles: string[] } {
    return { 
      success: true, 
      message: 'PUC Controller funcionando correctamente',
      timestamp: new Date().toISOString(),
      rutas_disponibles: [
        'GET /api/v1/puc/test',
        'GET /api/v1/puc/estadisticas', 
        'GET /api/v1/puc/arbol',
        'GET /api/v1/puc/buscar-filtros - ⭐ ENDPOINT PRINCIPAL',
        'GET /api/v1/puc/sugerencias',
        'GET /api/v1/puc/cuentas',
        'POST /api/v1/puc/cuentas',
        'GET /api/v1/puc/cuentas/:id',
        'PUT /api/v1/puc/cuentas/:id',
        'DELETE /api/v1/puc/cuentas/:id',
        'GET /api/v1/puc/buscar',
        'POST /api/v1/puc/validar/excel',
        'POST /api/v1/puc/importar/excel',
        'GET /api/v1/puc/exportar/excel',
        'GET /api/v1/puc/exportar/template'
      ]
    };
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas generales del PUC' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async obtenerEstadisticas(): Promise<any> {
    this.logger.log('📊 GET /api/v1/puc/estadisticas');
    return await this.pucService.obtenerEstadisticas();
  }

  // ===============================================
  // 🎯 ENDPOINT PRINCIPAL PARA BÚSQUEDA CON FILTROS AVANZADOS
  // ===============================================

  @Get('buscar-filtros')
  @ApiOperation({ 
    summary: '⭐ BUSCAR CUENTAS PUC CON FILTROS AVANZADOS - ENDPOINT PRINCIPAL',
    description: 'Permite buscar cuentas del PUC aplicando múltiples filtros, incluyendo búsqueda específica por código con subcuentas. Este es el endpoint principal para el sistema de filtros.'
  })
  @ApiQuery({ name: 'busqueda', required: false, description: 'Búsqueda general en código y descripción' })
  @ApiQuery({ name: 'busqueda_especifica', required: false, description: '🎯 Búsqueda específica por código (cuenta + subcuentas) - FUNCIONALIDAD PRINCIPAL' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'DETALLE'] })
  @ApiQuery({ name: 'naturaleza', required: false, enum: ['DEBITO', 'CREDITO'] })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'INACTIVA'] })
  @ApiQuery({ name: 'codigo_clase', required: false, description: 'Filtrar por clase (1-9)' })
  @ApiQuery({ name: 'nivel', required: false, description: 'Filtrar por nivel jerárquico (1-5)' })
  @ApiQuery({ name: 'codigo_padre', required: false, description: 'Filtrar por cuenta padre' })
  @ApiQuery({ name: 'solo_movimiento', required: false, type: 'boolean', description: 'Solo cuentas que aceptan movimientos' })
  @ApiQuery({ name: 'solo_con_saldo', required: false, type: 'boolean', description: 'Solo cuentas con saldo' })
  @ApiQuery({ name: 'solo_con_movimientos', required: false, type: 'boolean', description: 'Solo cuentas con movimientos' })
  @ApiQuery({ name: 'incluir_inactivas', required: false, type: 'boolean', description: 'Incluir cuentas inactivas' })
  @ApiQuery({ name: 'saldo_minimo', required: false, type: 'string', description: 'Saldo mínimo' })
  @ApiQuery({ name: 'saldo_maximo', required: false, type: 'string', description: 'Saldo máximo' })
  @ApiQuery({ name: 'fecha_desde', required: false, type: 'string', description: 'Fecha desde (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fecha_hasta', required: false, type: 'string', description: 'Fecha hasta (YYYY-MM-DD)' })
  @ApiQuery({ name: 'pagina', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limite', required: false, type: 'number', example: 50 })
  @ApiQuery({ name: 'ordenar_por', required: false, enum: ['codigo_completo', 'descripcion', 'nivel', 'tipo_cuenta', 'saldo_inicial', 'saldo_final'] })
  @ApiQuery({ name: 'orden', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Búsqueda exitosa con paginación y estadísticas completas' })
  @ApiResponse({ status: 400, description: 'Parámetros de búsqueda inválidos' })
  async buscarCuentasConFiltros(@Query() filtros: FiltrosPucDto) {
    try {
      this.logger.log(`🔍 Búsqueda PUC con filtros avanzados: ${JSON.stringify(filtros)}`);

      // Validar y limpiar filtros de búsqueda específica
      if (filtros.busqueda_especifica) {
        const codigoLimpio = filtros.busqueda_especifica.replace(/[^0-9]/g, '');
        if (codigoLimpio.length === 0) {
          throw new BadRequestException({
            success: false,
            message: 'Código PUC inválido para búsqueda específica',
            errores: ['El código debe contener solo números'],
            sugerencias: ['Ejemplo válido: 1105, 11, 1']
          });
        }
        // Actualizar filtros con código limpio
        filtros.busqueda_especifica = codigoLimpio;
      }

      const resultado = await this.pucService.buscarCuentasConFiltros(filtros);

      // Log para monitoreo
      this.logger.log(
        `✅ Búsqueda completada: ${resultado.total} resultados, ` +
        `página ${filtros.pagina}/${resultado.paginacion.totalPaginas}` +
        (filtros.busqueda_especifica ? ` [Específica: ${filtros.busqueda_especifica}*]` : '')
      );

      return {
        success: true,
        data: resultado.cuentas,
        meta: {
          paginacion: resultado.paginacion,
          estadisticas: resultado.estadisticas,
          filtros_aplicados: {
            ...filtros,
            timestamp: new Date().toISOString(),
            tipo_busqueda: filtros.busqueda_especifica ? 'especifica' : 'general'
          }
        },
        message: filtros.busqueda_especifica 
          ? `Mostrando cuenta ${filtros.busqueda_especifica} y sus subcuentas`
          : `Búsqueda general completada`
      };

    } catch (error) {
      this.logger.error(`❌ Error en búsqueda PUC: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Error interno en la búsqueda',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===============================================
  // 🌳 ENDPOINT PARA ÁRBOL JERÁRQUICO CON FILTROS
  // ===============================================

  @Get('arbol')
  @ApiOperation({ 
    summary: 'Obtener árbol jerárquico de cuentas PUC con filtros',
    description: 'Devuelve las cuentas organizadas en estructura de árbol jerárquico, opcionalmente filtradas'
  })
  @ApiQuery({ name: 'codigo_padre', required: false, type: String, description: 'Código de la cuenta padre para filtrar' })
  @ApiQuery({ name: 'incluir_inactivas', required: false, type: Boolean, description: 'Incluir cuentas inactivas', default: false })
  @ApiQuery({ name: 'busqueda_especifica', required: false, type: String, description: 'Filtrar árbol por código específico' })
  @ApiResponse({ status: 200, description: 'Árbol jerárquico obtenido exitosamente' })
  async obtenerArbol(
    @Query('codigo_padre') codigoPadre?: string,
    @Query('incluir_inactivas', new DefaultValuePipe(false), ParseBoolPipe) incluirInactivas: boolean = false,
    @Query('busqueda_especifica') busquedaEspecifica?: string
  ): Promise<any> {
    this.logger.log(`🌳 GET /api/v1/puc/arbol - padre: ${codigoPadre}, inactivas: ${incluirInactivas}, específica: ${busquedaEspecifica}`);
    
    if (busquedaEspecifica) {
      // Si hay búsqueda específica, usar el método con filtros
      const filtros: FiltrosPucDto = {
        busqueda_especifica: busquedaEspecifica.replace(/[^0-9]/g, ''),
        incluir_inactivas: incluirInactivas,
        limite: '9999',
        pagina: '1',
        paginaNum: 0,
        limiteNum: 0,
        offset: 0,
        esBusquedaEspecificaValida: false,
        claseDesdeEspecifica: null,
        limpiarFiltrosIncompatibles: function (): void {
          throw new Error('Function not implemented.');
        },
        rangoSaldoValido: false,
        rangoFechaValido: false
      };
      
      return await this.pucService.construirArbolConFiltros(filtros);
    }
    
    return await this.pucService.obtenerArbol(codigoPadre, incluirInactivas);
  }

  // ===============================================
  // 🔍 ENDPOINT PARA SUGERENCIAS DE BÚSQUEDA
  // ===============================================

  @Get('sugerencias')
  @ApiOperation({ 
    summary: 'Obtener sugerencias de búsqueda para autocompletar',
    description: 'Devuelve sugerencias de cuentas basadas en el término de búsqueda'
  })
  @ApiQuery({ name: 'termino', type: 'string', description: 'Término de búsqueda para sugerencias' })
  @ApiQuery({ name: 'limite', required: false, type: 'number', description: 'Límite de sugerencias', default: 10 })
  @ApiResponse({ status: 200, description: 'Sugerencias obtenidas exitosamente' })
  async obtenerSugerencias(
    @Query('termino') termino: string,
    @Query('limite', new DefaultValuePipe(10)) limite: number = 10
  ): Promise<any> {
    this.logger.log(`🔍 GET /api/v1/puc/sugerencias - término: "${termino}", límite: ${limite}`);
    
    if (!termino || termino.length < 2) {
      return {
        success: true,
        data: [],
        message: 'Término de búsqueda muy corto'
      };
    }

    const sugerencias = await this.pucService.obtenerSugerenciasBusqueda(termino);
    
    return {
      success: true,
      data: sugerencias.slice(0, limite),
      meta: {
        termino_busqueda: termino,
        total_sugerencias: sugerencias.length,
        limite_aplicado: limite
      }
    };
  }

  // ===============================================
  // 📋 ENDPOINTS CRUD DE CUENTAS (ORIGINALES MEJORADOS)
  // ===============================================

  @Get('cuentas')
  @ApiOperation({ 
    summary: 'Obtener lista de cuentas PUC con filtros (método simple)',
    description: 'NOTA: Para filtros avanzados usar /buscar-filtros'
  })
  @ApiResponse({ status: 200, description: 'Lista de cuentas obtenida exitosamente', type: [ResponsePucDto] })
  async obtenerCuentas(@Query() filtros: FiltrosPucDto): Promise<ResponsePucDto[]> {
    this.logger.log('📋 GET /api/v1/puc/cuentas - filtros:', filtros);
    return await this.pucService.obtenerCuentas(filtros);
  }

  @Post('cuentas')
  @ApiOperation({ summary: 'Crear nueva cuenta PUC' })
  @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente', type: ResponsePucDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearCuenta(@Body() createCuentaDto: CreateCuentaPucDto): Promise<ResponsePucDto> {
    this.logger.log('➕ POST /api/v1/puc/cuentas - datos:', createCuentaDto);
    return await this.pucService.crearCuenta(createCuentaDto);
  }

  @Get('cuentas/:id')
  @ApiOperation({ summary: 'Obtener cuenta PUC por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada', type: ResponsePucDto })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async obtenerCuentaPorId(@Param('id') id: number): Promise<ResponsePucDto> {
    this.logger.log(`🔍 GET /api/v1/puc/cuentas/${id}`);
    return await this.pucService.obtenerCuentaPorId(id);
  }

  @Put('cuentas/:id')
  @ApiOperation({ summary: 'Actualizar cuenta PUC' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente', type: ResponsePucDto })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async actualizarCuenta(
    @Param('id') id: number,
    @Body() updateCuentaDto: UpdateCuentaPucDto
  ): Promise<ResponsePucDto> {
    this.logger.log(`✏️ PUT /api/v1/puc/cuentas/${id} - datos:`, updateCuentaDto);
    return await this.pucService.actualizarCuenta(id, updateCuentaDto);
  }

  @Delete('cuentas/:id')
  @ApiOperation({ summary: 'Eliminar cuenta PUC (eliminación física)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async eliminarCuenta(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🗑️ DELETE /api/v1/puc/cuentas/${id}`);
    await this.pucService.eliminarCuenta(id);
    return { success: true, message: 'Cuenta eliminada exitosamente' };
  }

  // ===============================================
  // 🔍 ENDPOINTS DE VALIDACIÓN Y CONSULTA
  // ===============================================

  @Get('validar/:codigo')
  @ApiOperation({ summary: 'Validar código de cuenta PUC' })
  @ApiParam({ name: 'codigo', type: 'string', description: 'Código de cuenta a validar' })
  @ApiResponse({ status: 200, description: 'Resultado de la validación' })
  async validarCodigo(@Param('codigo') codigo: string): Promise<{
    valido: boolean;
    existe: boolean;
    nivel: number;
    padre_requerido?: string;
    padre_existe?: boolean;
    sugerencias?: string[];
  }> {
    this.logger.log(`🔍 GET /api/v1/puc/validar/${codigo}`);
    return await this.pucService.validarCodigo(codigo);
  }

  @Get('cuentas/:codigo/subcuentas')
  @ApiOperation({ summary: 'Obtener subcuentas de una cuenta específica' })
  @ApiParam({ name: 'codigo', type: 'string', description: 'Código de la cuenta padre' })
  @ApiQuery({ name: 'incluir_inactivas', required: false, type: Boolean, description: 'Incluir subcuentas inactivas', default: false })
  @ApiResponse({ status: 200, description: 'Lista de subcuentas obtenida exitosamente', type: [ResponsePucDto] })
  async obtenerSubcuentas(
    @Param('codigo') codigo: string,
    @Query('incluir_inactivas', new DefaultValuePipe(false), ParseBoolPipe) incluirInactivas: boolean = false
  ): Promise<ResponsePucDto[]> {
    this.logger.log(`🌿 GET /api/v1/puc/cuentas/${codigo}/subcuentas - inactivas: ${incluirInactivas}`);
    return await this.pucService.obtenerSubcuentas(codigo, incluirInactivas);
  }

  @Get('buscar')
  @ApiOperation({ 
    summary: 'Buscar cuentas PUC por nombre o código (método simple)',
    description: 'NOTA: Para búsquedas avanzadas usar /buscar-filtros'
  })
  @ApiQuery({ name: 'q', type: 'string', description: 'Término de búsqueda (nombre o código)' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite de resultados', default: 50 })
  @ApiQuery({ name: 'solo_activas', required: false, type: Boolean, description: 'Solo cuentas activas', default: true })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente', type: [ResponsePucDto] })
  async buscarCuentas(
    @Query('q') termino: string,
    @Query('limite', new DefaultValuePipe(50)) limite: number = 50,
    @Query('solo_activas', new DefaultValuePipe(true), ParseBoolPipe) soloActivas: boolean = true
  ): Promise<ResponsePucDto[]> {
    this.logger.log(`🔎 GET /api/v1/puc/buscar - término: "${termino}", límite: ${limite}, solo activas: ${soloActivas}`);
    return await this.pucService.buscarCuentas(termino, limite, soloActivas);
  }

  // ===============================================
  // 📤 ENDPOINTS DE EXPORTACIÓN EXCEL
  // ===============================================

  @Get('exportar/excel')
  @ApiOperation({ summary: 'Exportar PUC a archivo Excel con filtros' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiQuery({ name: 'incluir_saldos', required: false, type: Boolean, description: 'Incluir información de saldos', default: true })
  @ApiQuery({ name: 'incluir_movimientos', required: false, type: Boolean, description: 'Incluir información de movimientos', default: true })
  @ApiQuery({ name: 'incluir_fiscal', required: false, type: Boolean, description: 'Incluir información fiscal', default: true })
  @ApiQuery({ name: 'filtro_estado', required: false, type: String, description: 'Filtrar por estado de cuenta' })
  @ApiQuery({ name: 'filtro_tipo', required: false, type: String, description: 'Filtrar por tipo de cuenta' })
  @ApiQuery({ name: 'filtro_clase', required: false, type: String, description: 'Filtrar por clase de cuenta' })
  @ApiQuery({ name: 'busqueda_especifica', required: false, type: String, description: 'Exportar solo cuenta específica + subcuentas' })
  @ApiQuery({ name: 'solo_movimientos', required: false, type: Boolean, description: 'Solo cuentas que aceptan movimientos', default: false })
  @ApiQuery({ name: 'incluir_inactivas', required: false, type: Boolean, description: 'Incluir cuentas inactivas', default: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo Excel generado exitosamente',
    headers: {
      'Content-Type': { description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      'Content-Disposition': { description: 'attachment; filename="puc_export_YYYY-MM-DD.xlsx"' }
    }
  })
  async exportarExcel(
    @Res() res: Response,
    @Query('incluir_saldos', new DefaultValuePipe(true), ParseBoolPipe) incluirSaldos: boolean = true,
    @Query('incluir_movimientos', new DefaultValuePipe(true), ParseBoolPipe) incluirMovimientos: boolean = true,
    @Query('incluir_fiscal', new DefaultValuePipe(true), ParseBoolPipe) incluirFiscal: boolean = true,
    @Query('filtro_estado') filtroEstado?: string,
    @Query('filtro_tipo') filtroTipo?: string,
    @Query('filtro_clase') filtroClase?: string,
    @Query('busqueda_especifica') busquedaEspecifica?: string,
    @Query('solo_movimientos', new DefaultValuePipe(false), ParseBoolPipe) soloMovimientos: boolean = false,
    @Query('incluir_inactivas', new DefaultValuePipe(false), ParseBoolPipe) incluirInactivas: boolean = false
  ): Promise<void> {
    this.logger.log('📤 GET /api/v1/puc/exportar/excel - opciones:', {
      incluirSaldos, incluirMovimientos, incluirFiscal, filtroEstado, filtroTipo, filtroClase, 
      busquedaEspecifica, soloMovimientos, incluirInactivas
    });
    
    const opciones: ExportPucExcelDto = {
      incluir_saldos: incluirSaldos,
      incluir_movimientos: incluirMovimientos,
      incluir_fiscal: incluirFiscal,
      filtro_estado: filtroEstado as any,
      filtro_tipo: filtroTipo as any,
      filtro_clase: filtroClase,
      solo_movimientos: soloMovimientos,
      incluir_inactivas: incluirInactivas
    };

    const buffer = await this.pucExcelService.exportarAExcel(opciones);
    
    const fecha = new Date().toISOString().split('T')[0];
    const sufijo = busquedaEspecifica ? `_${busquedaEspecifica}` : '';
    const filename = `puc_export${sufijo}_${fecha}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString()
    });

    res.send(buffer);
  }

  @Get('exportar/template')
  @ApiOperation({ summary: 'Descargar template de Excel para importación de PUC' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiQuery({ name: 'con_ejemplos', required: false, type: Boolean, description: 'Incluir filas de ejemplo en el template', default: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Template Excel generado exitosamente',
    headers: {
      'Content-Type': { description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      'Content-Disposition': { description: 'attachment; filename="puc_template.xlsx"' }
    }
  })
  async descargarTemplate(
    @Res() res: Response,
    @Query('con_ejemplos', new DefaultValuePipe(true), ParseBoolPipe) conEjemplos: boolean = true
  ): Promise<void> {
    this.logger.log(`📄 GET /api/v1/puc/exportar/template - con ejemplos: ${conEjemplos}`);
    
    const buffer = await this.pucExcelService.generarTemplate(conEjemplos);
    
    const filename = `puc_template_${conEjemplos ? 'con_ejemplos' : 'vacio'}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString()
    });

    res.send(buffer);
  }

  // ===============================================
  // 📥 ENDPOINTS DE IMPORTACIÓN EXCEL
  // ===============================================

  @Post('validar/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Validar archivo Excel del PUC sin importar los datos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo Excel con estructura del PUC para validación',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel (.xlsx) con la estructura del PUC'
        },
        hoja: {
          type: 'string',
          default: 'PUC',
          description: 'Nombre de la hoja a validar'
        },
        fila_inicio: {
          type: 'number',
          default: 3,
          description: 'Fila donde inician los datos (después de headers)'
        },
        validar_jerarquia: {
          type: 'boolean',
          default: true,
          description: 'Validar estructura jerárquica de las cuentas'
        }
      },
      required: ['file']
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo validado exitosamente',
    type: ResultadoValidacionDto
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o errores de validación' })
  async validarExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() opciones: ValidarExcelDto
  ): Promise<ResultadoValidacionDto> {
    this.logger.log('🔍 POST /api/v1/puc/validar/excel - archivo:', file?.originalname);
    this.logger.log('Opciones de validación:', opciones);
    
    if (!file) {
      throw new BadRequestException({
        success: false,
        message: 'No se proporcionó archivo para validar'
      });
    }

    const validacion = await this.pucExcelService.validarArchivoExcel(file, opciones.hoja || 'PUC');
    
    // Convertir resultado a DTO
    return {
      es_valido: validacion.es_valido,
      total_filas: validacion.total_filas,
      filas_validas: validacion.total_filas - validacion.errores.length,
      errores: validacion.errores.map((error, index) => ({
        fila: index + 1,
        error: error
      })),
      advertencias: validacion.advertencias,
      estadisticas: {
        cuentas_por_nivel: {},
        cuentas_por_clase: {},
        duplicados_encontrados: 0,
        cuentas_sin_padre: 0
      }
    };
  }

  @Post('importar/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar PUC desde archivo Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo Excel con estructura del PUC y opciones de importación',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel (.xlsx) con la estructura del PUC'
        },
        sobreescribir: {
          type: 'boolean',
          default: false,
          description: 'Sobreescribir cuentas existentes'
        },
        validar_jerarquia: {
          type: 'boolean',
          default: true,
          description: 'Validar estructura jerárquica antes de importar'
        },
        importar_saldos: {
          type: 'boolean',
          default: true,
          description: 'Importar información de saldos desde el Excel'
        },
        importar_fiscal: {
          type: 'boolean',
          default: true,
          description: 'Importar información fiscal (F350, F300, etc.)'
        },
        hoja: {
          type: 'string',
          default: 'PUC',
          description: 'Nombre de la hoja de Excel a procesar'
        },
        fila_inicio: {
          type: 'number',
          default: 3,
          description: 'Fila donde inician los datos (después de headers)'
        }
      },
      required: ['file']
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo procesado exitosamente',
    type: ResultadoImportacionDto
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o errores de importación' })
  @HttpCode(HttpStatus.OK)
  async importarExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacionDto> {
    this.logger.log('📥 POST /api/v1/puc/importar/excel - archivo:', file?.originalname);
    this.logger.log('Opciones de importación:', opciones);
    
    if (!file) {
      throw new BadRequestException({
        success: false,
        message: 'No se proporcionó archivo para importar'
      });
    }

    const inicioTiempo = Date.now();
    const resultado = await this.pucExcelService.importarDesdeExcel(file, opciones);
    const tiempoProcesamiento = Date.now() - inicioTiempo;

    // Enriquecer resultado con información adicional
    const resultadoCompleto: ResultadoImportacionDto = {
      ...resultado,
      archivo_procesado: file.originalname,
      fecha_procesamiento: new Date(),
      resumen: {
        ...resultado.resumen,
        tiempo_procesamiento: tiempoProcesamiento
      }
    };

    this.logger.log(`✅ Importación completada en ${tiempoProcesamiento}ms:`, resultado.resumen);
    
    return resultadoCompleto;
  }

  // ===============================================
  // 📊 ENDPOINTS DE REPORTES
  // ===============================================

  @Get('reportes/por-clase')
  @ApiOperation({ summary: 'Obtener reporte de cuentas agrupadas por clase' })
  @ApiQuery({ name: 'incluir_saldos', required: false, type: Boolean, description: 'Incluir información de saldos', default: false })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  async reportePorClase(
    @Query('incluir_saldos', new DefaultValuePipe(false), ParseBoolPipe) incluirSaldos: boolean = false
  ): Promise<any> {
    this.logger.log(`📊 GET /api/v1/puc/reportes/por-clase - incluir saldos: ${incluirSaldos}`);
    return await this.pucService.reportePorClase(incluirSaldos);
  }

  @Get('reportes/jerarquia-completa')
  @ApiOperation({ summary: 'Obtener reporte completo de jerarquía PUC' })
  @ApiQuery({ name: 'formato', required: false, enum: ['json', 'tree'], description: 'Formato del reporte', default: 'json' })
  @ApiResponse({ status: 200, description: 'Reporte de jerarquía generado exitosamente' })
  async reporteJerarquiaCompleta(
    @Query('formato', new DefaultValuePipe('json')) formato: 'json' | 'tree' = 'json'
  ): Promise<any> {
    this.logger.log(`📊 GET /api/v1/puc/reportes/jerarquia-completa - formato: ${formato}`);
    return await this.pucService.reporteJerarquiaCompleta(formato);
  }

  // ===============================================
  // 🔧 ENDPOINTS DE MANTENIMIENTO
  // ===============================================

  @Post('mantenimiento/recalcular-jerarquia')
  @ApiOperation({ summary: 'Recalcular jerarquía y códigos padre de todas las cuentas' })
  @ApiResponse({ status: 200, description: 'Jerarquía recalculada exitosamente' })
  @HttpCode(HttpStatus.OK)
  async recalcularJerarquia(): Promise<{
    success: boolean;
    message: string;
    cuentas_actualizadas: number;
    errores: string[];
  }> {
    this.logger.log('🔧 POST /api/v1/puc/mantenimiento/recalcular-jerarquia');
    return await this.pucService.recalcularJerarquia();
  }

  @Post('mantenimiento/validar-integridad')
  @ApiOperation({ summary: 'Validar integridad de la estructura PUC' })
  @ApiResponse({ status: 200, description: 'Validación de integridad completada' })
  @HttpCode(HttpStatus.OK)
  async validarIntegridad(): Promise<{
    valido: boolean;
    total_cuentas: number;
    errores_encontrados: string[];
    advertencias: string[];
    recomendaciones: string[];
  }> {
    this.logger.log('🔧 POST /api/v1/puc/mantenimiento/validar-integridad');
    return await this.pucService.validarIntegridad();
  }
}