// backend-nestjs/src/puc/puc.controller.ts
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
  HttpStatus
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
  ApiBody
} from '@nestjs/swagger';

import { PucService } from './puc.service';
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';
import { ImportPucExcelDto } from './dto/import-puc-excel.dto';
import { ExportPucExcelDto } from './dto/export-puc-excel.dto';
// Importar los tipos necesarios
import { ResponsePucDto } from './dto/response-puc.dto';
import { ValidacionExcel, ResultadoImportacion } from './interfaces/excel-row.interface';

@ApiTags('🏛️ PUC')
@Controller('puc')
export class PucController {
  constructor(private readonly pucService: PucService) {
    console.log('🎯 PucController inicializado - rutas disponibles en /api/v1/puc');
  }

  // ✅ ENDPOINT DE PRUEBA
  @Get('test')
  @ApiOperation({ summary: 'Endpoint de prueba' })
  test(): { success: boolean; message: string; timestamp: string; rutas_disponibles: string[] } {
    return { 
      success: true, 
      message: 'PUC Controller funcionando correctamente',
      timestamp: new Date().toISOString(),
      rutas_disponibles: [
        'GET /api/v1/puc/test',
        'GET /api/v1/puc/estadisticas', 
        'GET /api/v1/puc/arbol',
        'GET /api/v1/puc/cuentas',
        'POST /api/v1/puc/cuentas',
        'GET /api/v1/puc/cuentas/:id',
        'PUT /api/v1/puc/cuentas/:id',
        'DELETE /api/v1/puc/cuentas/:id',
        'POST /api/v1/puc/importar/excel',
        'GET /api/v1/puc/exportar/excel',
        'GET /api/v1/puc/exportar/template',
        'POST /api/v1/puc/validar/excel'
      ]
    };
  }

  // ✅ OBTENER ESTADÍSTICAS
  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas del PUC' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async obtenerEstadisticas(): Promise<any> {
    console.log('📊 GET /api/v1/puc/estadisticas');
    return await this.pucService.obtenerEstadisticas();
  }

  // ✅ OBTENER ÁRBOL JERÁRQUICO
  @Get('arbol')
  @ApiOperation({ summary: 'Obtener árbol jerárquico de cuentas' })
  @ApiQuery({ name: 'codigo_padre', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Árbol obtenido exitosamente' })
  async obtenerArbol(@Query('codigo_padre') codigoPadre?: string): Promise<any> {
    console.log('🌳 GET /api/v1/puc/arbol - codigo_padre:', codigoPadre);
    return await this.pucService.obtenerArbol(codigoPadre);
  }

  // ✅ OBTENER CUENTAS CON FILTROS Y PAGINACIÓN
  @Get('cuentas')
  @ApiOperation({ summary: 'Obtener cuentas con filtros y paginación' })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'INACTIVA'] })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'busqueda', required: false, type: String })
  @ApiQuery({ name: 'tipo', required: false, enum: ['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'DETALLE'] })
  @ApiQuery({ name: 'naturaleza', required: false, enum: ['DEBITO', 'CREDITO'] })
  @ApiQuery({ name: 'codigo_padre', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Cuentas obtenidas exitosamente' })
  async obtenerCuentas(@Query() query: any): Promise<any> {
    console.log('📋 GET /api/v1/puc/cuentas - filtros:', query);
    const filtros: FiltrosPucDto = {
      estado: query.estado,
      limite: query.limite,
      pagina: query.pagina,
      busqueda: query.busqueda,
      tipo: query.tipo,
      naturaleza: query.naturaleza,
      codigo_padre: query.codigo_padre,
      ...(query.orden_por && { orden_por: query.orden_por }),
      ...(query.orden_direccion && { orden_direccion: query.orden_direccion }),
    };
    return await this.pucService.obtenerTodas(filtros);
  }

  // ✅ CREAR NUEVA CUENTA
  @Post('cuentas')
  @ApiOperation({ summary: 'Crear nueva cuenta PUC' })
  @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearCuenta(@Body() createCuentaDto: CreateCuentaPucDto): Promise<any> {
    console.log('➕ POST /api/v1/puc/cuentas', createCuentaDto);
    return await this.pucService.crear(createCuentaDto);
  }

  // ✅ OBTENER CUENTA POR ID
  @Get('cuentas/:id')
  @ApiOperation({ summary: 'Obtener cuenta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async obtenerCuentaPorId(@Param('id') id: number): Promise<any> {
    console.log('🔍 GET /api/v1/puc/cuentas/' + id);
    return await this.pucService.obtenerPorId(id);
  }

  // ✅ ACTUALIZAR CUENTA
  @Put('cuentas/:id')
  @ApiOperation({ summary: 'Actualizar cuenta PUC' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async actualizarCuenta(
    @Param('id') id: number,
    @Body() updateCuentaDto: UpdateCuentaPucDto
  ): Promise<any> {
    console.log('✏️ PUT /api/v1/puc/cuentas/' + id, updateCuentaDto);
    return await this.pucService.actualizar(id, updateCuentaDto);
  }

  // ✅ ELIMINAR CUENTA
  @Delete('cuentas/:id')
  @ApiOperation({ summary: 'Eliminar cuenta PUC' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async eliminarCuenta(@Param('id') id: number): Promise<any> {
    console.log('🗑️ DELETE /api/v1/puc/cuentas/' + id);
    return await this.pucService.eliminar(id);
  }

  // ================================================
  // 🆕 NUEVOS ENDPOINTS PARA EXCEL
  // ================================================

  // ✅ IMPORTAR DESDE EXCEL
  @Post('importar/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar PUC desde archivo Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo Excel con estructura del PUC',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        options: {
          type: 'object',
          properties: {
            sobreescribir: { type: 'boolean', default: false },
            validar_jerarquia: { type: 'boolean', default: true },
            importar_saldos: { type: 'boolean', default: true },
            hoja: { type: 'string', default: 'PUC' }
          }
        }
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Archivo procesado exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido o errores de validación' })
  async importarExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    console.log('📥 POST /api/v1/puc/importar/excel - archivo:', file?.originalname);
    console.log('Opciones:', options);
    
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    return await this.pucService.importarDesdeExcel(file, options);
  }

  // ✅ VALIDAR ARCHIVO EXCEL SIN IMPORTAR
  @Post('validar/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Validar archivo Excel del PUC sin importar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo Excel a validar',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        hoja: { type: 'string', default: 'PUC' }
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Validación completada' })
  async validarExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('hoja') hoja: string = 'PUC'
  ): Promise<ValidacionExcel> {
    console.log('✅ POST /api/v1/puc/validar/excel - archivo:', file?.originalname);
    
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    return await this.pucService.validarArchivoExcel(file, hoja);
  }

  // ✅ EXPORTAR A EXCEL
  @Get('exportar/excel')
  @ApiOperation({ summary: 'Exportar PUC a archivo Excel' })
  @ApiQuery({ name: 'incluir_saldos', required: false, type: Boolean, description: 'Incluir saldos en la exportación' })
  @ApiQuery({ name: 'incluir_movimientos', required: false, type: Boolean, description: 'Incluir movimientos' })
  @ApiQuery({ name: 'filtro_estado', required: false, enum: ['ACTIVA', 'INACTIVA', 'TODAS'] })
  @ApiQuery({ name: 'filtro_tipo', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo Excel generado',
    headers: {
      'Content-Type': { description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      'Content-Disposition': { description: 'attachment; filename="puc_export.xlsx"' }
    }
  })
  async exportarExcel(
    @Query('incluir_saldos') incluirSaldos: boolean = true,
    @Query('incluir_movimientos') incluirMovimientos: boolean = true,
    @Query('filtro_estado') filtroEstado: string = 'ACTIVA',
    @Res() res: Response,
    @Query('filtro_tipo') filtroTipo?: string
  ): Promise<void> {
    console.log('📤 GET /api/v1/puc/exportar/excel');
    
    const opciones: ExportPucExcelDto = {
      incluir_saldos: incluirSaldos,
      incluir_movimientos: incluirMovimientos,
      filtro_estado: filtroEstado,
      filtro_tipo: filtroTipo
    };

    const buffer = await this.pucService.exportarAExcel(opciones);
    
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `puc_export_${fecha}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString()
    });

    res.send(buffer);
  }

  // ✅ DESCARGAR TEMPLATE DE EXCEL
  @Get('exportar/template')
  @ApiOperation({ summary: 'Descargar template de Excel para importación' })
  @ApiQuery({ name: 'con_ejemplos', required: false, type: Boolean, description: 'Incluir filas de ejemplo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Template Excel generado',
    headers: {
      'Content-Type': { description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      'Content-Disposition': { description: 'attachment; filename="puc_template.xlsx"' }
    }
  })
  async descargarTemplate(
    @Query('con_ejemplos') conEjemplos: boolean = true,
    @Res() res: Response
  ): Promise<void> {
    console.log('📄 GET /api/v1/puc/exportar/template');
    
    const buffer = await this.pucService.generarTemplateExcel(conEjemplos);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="puc_template.xlsx"',
      'Content-Length': buffer.length.toString()
    });

    res.send(buffer);
  }

  // ✅ OBTENER CUENTA POR CÓDIGO (ruta específica antes de parámetros genéricos)
  @Get('cuentas/codigo/:codigo')
  @ApiOperation({ summary: 'Obtener cuenta por código' })
  @ApiParam({ name: 'codigo', description: 'Código de la cuenta', type: 'string' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async obtenerPorCodigo(@Param('codigo') codigo: string): Promise<any> {
    console.log('🔍 GET /api/v1/puc/cuentas/codigo/' + codigo);
    return await this.pucService.obtenerPorCodigo(codigo);
  }

  // ✅ OBTENER SUBCUENTAS
  @Get('cuentas/:codigo/subcuentas')
  @ApiOperation({ summary: 'Obtener subcuentas de una cuenta específica' })
  @ApiParam({ name: 'codigo', description: 'Código de la cuenta padre', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subcuentas obtenidas exitosamente' })
  async obtenerSubcuentas(@Param('codigo') codigo: string): Promise<any> {
    console.log('🌿 GET /api/v1/puc/cuentas/' + codigo + '/subcuentas');
    return await this.pucService.obtenerSubcuentas(codigo);
  }

  // ✅ VALIDAR CÓDIGO
  @Get('validar/:codigo')
  @ApiOperation({ summary: 'Validar un código PUC' })
  @ApiParam({ name: 'codigo', description: 'Código a validar', type: 'string' })
  @ApiResponse({ status: 200, description: 'Validación completada' })
  async validarCodigo(@Param('codigo') codigo: string): Promise<any> {
    console.log('✅ GET /api/v1/puc/validar/' + codigo);
    return await this.pucService.validarCodigo(codigo);
  }

  // ✅ IMPORTAR PUC ESTÁNDAR
  @Post('importar/estandar')
  @ApiOperation({ summary: 'Importar PUC estándar de Colombia' })
  @ApiResponse({ status: 200, description: 'PUC importado exitosamente' })
  async importarPucEstandar(): Promise<any> {
    console.log('📥 POST /api/v1/puc/importar/estandar');
    return await this.pucService.importarPucEstandar();
  }

  // ✅ LIMPIAR/RESETEAR PUC
  @Delete('limpiar')
  @ApiOperation({ summary: 'Limpiar todas las cuentas del PUC' })
  @ApiResponse({ status: 200, description: 'PUC limpiado exitosamente' })
  async limpiarPuc(): Promise<any> {
    console.log('🧹 DELETE /api/v1/puc/limpiar');
    return await this.pucService.limpiarPuc();
  }

  // ✅ OBTENER REPORTE DE SALDOS
  @Get('reportes/saldos')
  @ApiOperation({ summary: 'Obtener reporte de saldos del PUC' })
  @ApiQuery({ name: 'fecha_corte', required: false, type: String })
  @ApiQuery({ name: 'nivel', required: false, type: Number })
  @ApiQuery({ name: 'incluir_ceros', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  async reporteSaldos(
    @Query('fecha_corte') fechaCorte?: string,
    @Query('nivel') nivel?: number,
    @Query('incluir_ceros') incluirCeros: boolean = false
  ): Promise<any> {
    console.log('📊 GET /api/v1/puc/reportes/saldos');
    return await this.pucService.generarReporteSaldos({
      fecha_corte: fechaCorte,
      nivel: nivel,
      incluir_ceros: incluirCeros
    });
  }
}
