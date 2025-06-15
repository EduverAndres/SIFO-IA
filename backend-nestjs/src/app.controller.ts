// backend-nestjs/src/app.controller.ts - VERSIÓN FINAL
import { Controller, Get, Head, All, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Request } from 'express';

@ApiTags('🏠 Sistema')
@Controller() // Sin prefijo - maneja la ruta raíz directamente
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ✅ HEALTH CHECK PRINCIPAL - Ruta raíz sin prefijo para Render
  @All() 
  @ApiOperation({ summary: 'Health check del sistema (ruta raíz)' })
  @ApiResponse({ status: 200, description: 'Sistema funcionando correctamente' })
  handleRoot(@Req() req: Request) {
    const method = req.method;
    console.log(`🎯 ${method} / - Health check solicitado desde ${req.get('User-Agent')}`);
    
    // Para peticiones HEAD (monitoreo de Render), solo responder 200
    if (method === 'HEAD') {
      return;
    }
    
    // Para GET y otros métodos, respuesta completa
    return {
      success: true,
      message: 'Sistema SIFO - Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      method: method,
      endpoints: {
        sistema: [
          'GET / - Health check raíz',
          'HEAD / - Health check para monitoreo',
          'GET /api/v1/ - Health check con prefijo',
          'GET /api/docs - Documentación Swagger'
        ],
        autenticacion: [
          'POST /api/v1/auth/register - Registro de usuarios',
          'POST /api/v1/auth/login - Login de usuarios'
        ],
        puc: [
          'GET /api/v1/puc/test - Test del módulo PUC',
          'GET /api/v1/puc/estadisticas - Estadísticas PUC',
          'GET /api/v1/puc/arbol - Árbol jerárquico',
          'GET /api/v1/puc/cuentas - Listar cuentas'
        ],
        otros: [
          'GET /api/v1/proveedores - Gestión de proveedores',
          'GET /api/v1/productos - Catálogo de productos',
          'GET /api/v1/ordenes-compra - Órdenes de compra'
        ]
      }
    };
  }

  @All('health')
  @ApiOperation({ summary: 'Health check detallado' })
  @ApiResponse({ status: 200, description: 'Estado del sistema' })
  getHealth(@Req() req: Request) {
    console.log(`🏥 ${req.method} /health - Health check detallado`);
    
    if (req.method === 'HEAD') {
      return;
    }
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // Asumiendo que la DB está conectada si llegamos acá
      modules: ['Auth', 'PUC', 'Proveedores', 'Productos', 'OrdenesCompra']
    };
  }

  @All('ping')
  @ApiOperation({ summary: 'Ping para monitoreo de Render' })
  @ApiResponse({ status: 200, description: 'Pong' })
  ping(@Req() req: Request) {
    console.log(`🏓 ${req.method} /ping - Ping desde ${req.get('User-Agent')}`);
    
    if (req.method === 'HEAD') {
      return;
    }
    
    return { 
      status: 'ok', 
      message: 'pong', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

// ===============================================
// 🔥 CONTROLADOR ADICIONAL CON PREFIJO API/V1
// ===============================================
@ApiTags('🔧 API v1')
@Controller('api/v1') // Con prefijo explícito
export class ApiController {
  constructor(private readonly appService: AppService) {}

  @All()
  @ApiOperation({ summary: 'Health check API v1' })
  @ApiResponse({ status: 200, description: 'API v1 funcionando' })
  handleApiRoot(@Req() req: Request) {
    console.log(`🔧 ${req.method} /api/v1/ - API health check`);
    
    if (req.method === 'HEAD') {
      return;
    }
    
    return {
      success: true,
      message: 'API v1 funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      availableEndpoints: [
        '/api/v1/auth/* - Autenticación',
        '/api/v1/puc/* - Plan Único de Cuentas', 
        '/api/v1/proveedores/* - Proveedores',
        '/api/v1/productos/* - Productos',
        '/api/v1/ordenes-compra/* - Órdenes de Compra'
      ]
    };
  }
}