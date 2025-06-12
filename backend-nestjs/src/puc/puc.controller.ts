// src/puc/puc.controller.ts - VERSIÓN CORREGIDA PARA ELIMINACIÓN
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PucService } from './puc.service';
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';
import { 
  ResponsePuc, 
  NodoPucResponse, 
  EstadisticasPuc, 
  ValidacionCodigo 
} from './interfaces/puc.interface';
import { CuentaPuc } from './entities/cuenta-puc.entity';

@ApiTags('🏛️ Plan Único de Cuentas (PUC)')
@Controller('puc')
export class PucController {
  constructor(private readonly pucService: PucService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva cuenta PUC',
    description: 'Crea una nueva cuenta en el Plan Único de Cuentas con validaciones automáticas'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Cuenta creada exitosamente',
    type: CuentaPuc
  })
  async crear(@Body() createCuentaPucDto: CreateCuentaPucDto): Promise<ResponsePuc<CuentaPuc>> {
    console.log('➕ [CONTROLLER] POST /api/v1/puc - Crear cuenta:', createCuentaPucDto);
    
    try {
      const resultado = await this.pucService.crear(createCuentaPucDto);
      console.log('✅ Cuenta creada exitosamente:', resultado.data?.codigo);
      return resultado;
    } catch (error) {
      console.error('❌ Error al crear cuenta:', error.message);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las cuentas con filtros',
    description: 'Lista todas las cuentas del PUC con opciones de filtrado y paginación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cuentas obtenida exitosamente'
  })
  async obtenerTodas(@Query() filtros: FiltrosPucDto): Promise<ResponsePuc<CuentaPuc[]>> {
    console.log('📋 [CONTROLLER] GET /api/v1/puc - Filtros:', filtros);
    
    try {
      const resultado = await this.pucService.obtenerTodas(filtros);
      console.log('✅ Cuentas obtenidas:', resultado.data?.length || 0);
      return resultado;
    } catch (error) {
      console.error('❌ Error al obtener cuentas:', error.message);
      throw error;
    }
  }

  @Get('estadisticas')
  @ApiOperation({ 
    summary: 'Obtener estadísticas del PUC',
    description: 'Retorna estadísticas completas del Plan Único de Cuentas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente'
  })
  async obtenerEstadisticas(): Promise<ResponsePuc<EstadisticasPuc>> {
    console.log('📊 [CONTROLLER] GET /api/v1/puc/estadisticas');
    
    try {
      const resultado = await this.pucService.obtenerEstadisticas();
      console.log('✅ Estadísticas obtenidas');
      return resultado;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error.message);
      throw error;
    }
  }

  @Get('arbol')
  @ApiOperation({ 
    summary: 'Obtener estructura jerárquica',
    description: 'Retorna el árbol jerárquico del PUC desde un punto específico'
  })
  @ApiQuery({ 
    name: 'codigo_padre', 
    required: false, 
    description: 'Código del nodo padre. Si no se especifica, retorna desde la raíz' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Árbol jerárquico obtenido exitosamente'
  })
  async obtenerArbol(@Query('codigo_padre') codigoPadre?: string): Promise<ResponsePuc<NodoPucResponse[]>> {
    console.log('🌳 [CONTROLLER] GET /api/v1/puc/arbol - Código padre:', codigoPadre || 'raíz');
    
    try {
      const resultado = await this.pucService.obtenerArbol(codigoPadre);
      console.log('✅ Árbol obtenido');
      return resultado;
    } catch (error) {
      console.error('❌ Error al obtener árbol:', error.message);
      throw error;
    }
  }

  @Post('importar-estandar')
  @ApiOperation({ 
    summary: 'Verificar PUC estándar colombiano',
    description: 'Verifica si el PUC estándar colombiano está disponible en la base de datos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificación del PUC estándar completada'
  })
  async importarPucEstandar(): Promise<ResponsePuc<any>> {
    console.log('📥 [CONTROLLER] POST /api/v1/puc/importar-estandar');
    
    try {
      const resultado = await this.pucService.importarPucEstandar();
      console.log('✅ PUC estándar verificado');
      return resultado;
    } catch (error) {
      console.error('❌ Error al verificar PUC estándar:', error.message);
      throw error;
    }
  }

  @Get('validar/:codigo')
  @ApiOperation({ 
    summary: 'Validar código de cuenta',
    description: 'Valida un código de cuenta y proporciona sugerencias automáticas'
  })
  @ApiParam({ 
    name: 'codigo', 
    description: 'Código de cuenta a validar',
    example: '1105'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación completada exitosamente'
  })
  async validarCodigo(@Param('codigo') codigo: string): Promise<ResponsePuc<ValidacionCodigo>> {
    console.log('✔️ [CONTROLLER] GET /api/v1/puc/validar/' + codigo);
    
    try {
      const resultado = await this.pucService.validarCodigo(codigo);
      console.log('✅ Código validado:', codigo, '- Disponible:', resultado.data?.disponible);
      return resultado;
    } catch (error) {
      console.error('❌ Error al validar código:', error.message);
      throw error;
    }
  }

  @Get('codigo/:codigo')
  @ApiOperation({ 
    summary: 'Obtener cuenta por código',
    description: 'Busca y retorna una cuenta específica por su código único'
  })
  @ApiParam({ 
    name: 'codigo', 
    description: 'Código único de la cuenta',
    example: '1105'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cuenta encontrada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cuenta no encontrada'
  })
  async obtenerPorCodigo(@Param('codigo') codigo: string): Promise<ResponsePuc<CuentaPuc>> {
    console.log('🔍 [CONTROLLER] GET /api/v1/puc/codigo/' + codigo);
    
    try {
      const resultado = await this.pucService.obtenerPorCodigo(codigo);
      console.log('✅ Cuenta encontrada por código:', codigo);
      return resultado;
    } catch (error) {
      console.error('❌ Error al obtener cuenta por código:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener cuenta por ID',
    description: 'Busca y retorna una cuenta específica por su ID interno'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID interno de la cuenta',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cuenta encontrada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cuenta no encontrada'
  })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<ResponsePuc<CuentaPuc>> {
    console.log('🔍 [CONTROLLER] GET /api/v1/puc/' + id);
    
    try {
      const resultado = await this.pucService.obtenerPorId(id);
      console.log('✅ Cuenta encontrada por ID:', id);
      return resultado;
    } catch (error) {
      console.error('❌ Error al obtener cuenta por ID:', error.message);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar cuenta',
    description: 'Actualiza los datos de una cuenta existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID interno de la cuenta a actualizar',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cuenta actualizada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cuenta no encontrada'
  })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCuentaPucDto: UpdateCuentaPucDto
  ): Promise<ResponsePuc<CuentaPuc>> {
    console.log('✏️ [CONTROLLER] PATCH /api/v1/puc/' + id, updateCuentaPucDto);
    
    try {
      const resultado = await this.pucService.actualizar(id, updateCuentaPucDto);
      console.log('✅ Cuenta actualizada exitosamente - ID:', id);
      return resultado;
    } catch (error) {
      console.error('❌ Error al actualizar cuenta - ID:', id, 'Error:', error.message);
      throw error;
    }
  }

  // ✅ ELIMINAR CUENTA - ENDPOINT PRINCIPAL Y ÚNICO
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar cuenta',
    description: 'Elimina una cuenta del PUC (solo si no tiene subcuentas asociadas)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID interno de la cuenta a eliminar',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cuenta eliminada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cuenta no encontrada'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar la cuenta porque tiene subcuentas asociadas'
  })
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResponsePuc<null>> {
    console.log('🗑️ [CONTROLLER] DELETE /api/v1/puc/' + id + ' - ENDPOINT LLAMADO');
    
    try {
      const resultado = await this.pucService.eliminar(id);
      console.log('✅ Cuenta eliminada exitosamente - ID:', id);
      return resultado;
    } catch (error) {
      console.error('❌ Error al eliminar cuenta - ID:', id, 'Error:', error.message);
      throw error;
    }
  }
}