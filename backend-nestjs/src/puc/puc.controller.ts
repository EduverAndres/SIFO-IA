// src/puc/puc.controller.ts - VERSIÓN LIMPIA Y CORREGIDA
// ==========================================
// 📦 IMPORTS DE NESTJS/COMMON
// ==========================================
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';

// ==========================================
// 📚 IMPORTS DE SWAGGER/OPENAPI
// ==========================================
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';

// ==========================================
// 🏗️ IMPORTS DE SERVICIOS
// ==========================================
import { PucService } from './puc.service';

// ==========================================
// 📋 IMPORTS DE DTOs (DATA TRANSFER OBJECTS)
// ==========================================
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';

@ApiTags('🏛️ PUC')
@Controller('puc')  // ← Solo 'puc' porque el prefix global ya agrega 'api/v1'
export class PucController {
  constructor(private readonly pucService: PucService) {
    console.log('🎯 PucController inicializado - rutas disponibles en /api/v1/puc');
  }

  // ✅ ENDPOINT DE PRUEBA
  @Get('test')
  @ApiOperation({ summary: 'Endpoint de prueba' })
  test() {
    return { 
      success: true, 
      message: 'PUC Controller funcionando correctamente',
      timestamp: new Date().toISOString(),
      rutas_reales: [
        'GET /api/v1/puc/test',
        'GET /api/v1/puc/estadisticas', 
        'GET /api/v1/puc/arbol',
        'GET /api/v1/puc/cuentas',
        'POST /api/v1/puc/cuentas',
        'GET /api/v1/puc/cuentas/:id',
        'PUT /api/v1/puc/cuentas/:id',
        'DELETE /api/v1/puc/cuentas/:id'
      ]
    };
  }

  // ✅ OBTENER ESTADÍSTICAS
  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas del PUC' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async obtenerEstadisticas() {
    console.log('📊 GET /api/v1/puc/estadisticas');
    return await this.pucService.obtenerEstadisticas();
  }

  // ✅ OBTENER ÁRBOL JERÁRQUICO
  @Get('arbol')
  @ApiOperation({ summary: 'Obtener árbol jerárquico de cuentas' })
  @ApiQuery({ name: 'codigo_padre', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Árbol obtenido exitosamente' })
  async obtenerArbol(@Query('codigo_padre') codigoPadre?: string) {
    console.log('🌳 GET /api/v1/puc/arbol - codigo_padre:', codigoPadre);
    return await this.pucService.obtenerArbol(codigoPadre);
  }

  // ✅ VALIDAR CÓDIGO
  @Get('validar/:codigo')
  @ApiOperation({ summary: 'Validar un código PUC' })
  @ApiParam({ name: 'codigo', description: 'Código a validar', type: 'string' })
  @ApiResponse({ status: 200, description: 'Validación completada' })
  async validarCodigo(@Param('codigo') codigo: string) {
    console.log('✅ GET /api/v1/puc/validar/' + codigo);
    return await this.pucService.validarCodigo(codigo);
  }

  // ✅ IMPORTAR PUC ESTÁNDAR
  @Post('importar/estandar')
  @ApiOperation({ summary: 'Importar PUC estándar de Colombia' })
  @ApiResponse({ status: 200, description: 'PUC importado exitosamente' })
  async importarPucEstandar() {
    console.log('📥 POST /api/v1/puc/importar/estandar');
    return await this.pucService.importarPucEstandar();
  }

  // ✅ OBTENER CUENTA POR CÓDIGO (antes de las rutas con parámetros)
  @Get('cuentas/codigo/:codigo')
  @ApiOperation({ summary: 'Obtener cuenta por código' })
  @ApiParam({ name: 'codigo', description: 'Código de la cuenta', type: 'string' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async obtenerPorCodigo(@Param('codigo') codigo: string) {
    console.log('🔍 GET /api/v1/puc/cuentas/codigo/' + codigo);
    return await this.pucService.obtenerPorCodigo(codigo);
  }

  // ✅ OBTENER SUBCUENTAS
  @Get('cuentas/:codigo/subcuentas')
  @ApiOperation({ summary: 'Obtener subcuentas de una cuenta específica' })
  @ApiParam({ name: 'codigo', description: 'Código de la cuenta padre', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subcuentas obtenidas exitosamente' })
  async obtenerSubcuentas(@Param('codigo') codigo: string) {
    console.log('📁 GET /api/v1/puc/cuentas/' + codigo + '/subcuentas');
    const filtros: FiltrosPucDto = {
      codigo_padre: codigo,
      limite: '100',   // <-- como string
      pagina: '1'      // <-- como string
    };
    return await this.pucService.obtenerTodas(filtros);
  }

  // ✅ CREAR CUENTA
  @Post('cuentas')
  @ApiOperation({ summary: 'Crear una nueva cuenta PUC' })
  @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  async crear(@Body() createCuentaPucDto: CreateCuentaPucDto) {
    console.log('➕ POST /api/v1/puc/cuentas - código:', createCuentaPucDto.codigo);
    return await this.pucService.crear(createCuentaPucDto);
  }

  // ✅ OBTENER CUENTA POR ID
  @Get('cuentas/:id')
  @ApiOperation({ summary: 'Obtener cuenta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    console.log('🆔 GET /api/v1/puc/cuentas/' + id);
    return await this.pucService.obtenerPorId(id);
  }

  // ✅ ACTUALIZAR CUENTA
  @Put('cuentas/:id')
  @ApiOperation({ summary: 'Actualizar una cuenta existente' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta a actualizar', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCuentaPucDto: UpdateCuentaPucDto
  ) {
    console.log('✏️ PUT /api/v1/puc/cuentas/' + id);
    return await this.pucService.actualizar(id, updateCuentaPucDto);
  }

  // ✅ ELIMINAR CUENTA - ENDPOINT PRINCIPAL CORREGIDO
  @Delete('cuentas/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una cuenta' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta a eliminar', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar, tiene subcuentas asociadas' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    console.log('🗑️ DELETE /api/v1/puc/cuentas/' + id);
    
    try {
      const resultado = await this.pucService.eliminar(id);
      console.log('✅ Cuenta eliminada exitosamente - ID:', id);
      return resultado;
    } catch (error) {
      console.error('❌ Error al eliminar cuenta - ID:', id, 'Error:', error.message);
      throw error;
    }
  }

  // ✅ OBTENER CUENTAS CON FILTROS (debe ir al final)
  @Get('cuentas')
  @ApiOperation({ summary: 'Obtener cuentas con filtros' })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'INACTIVA'] })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'busqueda', required: false, type: String })
  @ApiQuery({ name: 'tipo', required: false, enum: ['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'AUXILIAR'] })
  @ApiQuery({ name: 'naturaleza', required: false, enum: ['DEBITO', 'CREDITO'] })
  @ApiQuery({ name: 'codigo_padre', required: false, type: String })
  @ApiQuery({ name: 'orden_por', required: false, type: String })
  @ApiQuery({ name: 'orden_direccion', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Cuentas obtenidas exitosamente' })
  async obtenerCuentas(@Query() query: any) {
    console.log('📋 GET /api/v1/puc/cuentas - filtros:', query);

    // No conviertas limite ni pagina a número, déjalos como string para el DTO y el servicio
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

  // ✅ EXPORTAR CUENTAS
  @Get('exportar')
  @ApiOperation({ summary: 'Exportar cuentas PUC' })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'INACTIVA'] })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'busqueda', required: false, type: String })
  @ApiQuery({ name: 'tipo', required: false, enum: ['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'AUXILIAR'] })
  @ApiQuery({ name: 'naturaleza', required: false, enum: ['DEBITO', 'CREDITO'] })
  @ApiQuery({ name: 'codigo_padre', required: false, type: String })
  @ApiQuery({ name: 'orden_por', required: false, type: String })
  @ApiQuery({ name: 'orden_direccion', required: false, type: String })
  @ApiQuery({ name: 'formato', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Exportación exitosa' })
  async exportar(@Query() filtros: FiltrosPucDto, @Query('formato') formato: string) {
    return await this.pucService.exportar(filtros, formato);
  }
}