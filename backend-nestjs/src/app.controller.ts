// backend-nestjs/src/app.controller.ts
import { Controller, Get, Head, All, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Request } from 'express';

@ApiTags('🏠 Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ✅ HEALTH CHECK PRINCIPAL - Soporta GET y HEAD
  @All() // Maneja todos los métodos HTTP en la ruta raíz
  @ApiOperation({ summary: 'Health check del sistema' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sistema funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
        version: { type: 'string' },
        environment: { type: 'string' },
        endpoints: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  handleRoot(@Req() req: Request) {
    const method = req.method;
    console.log(`🎯 ${method} / - Health check solicitado`);
    
    // Para peticiones HEAD, solo devolvemos headers sin body
    if (method === 'HEAD') {
      return;
    }
    
    // Para GET y otros métodos, devolvemos el JSON completo
    return {
      success: true,
      message: 'Sistema SIFO - Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      method: method,
      endpoints: [
        'GET /api/v1/ - Health check',
        'HEAD /api/v1/ - Health check (solo headers)',
        'GET /api/docs - Documentación Swagger',
        'POST /api/v1/auth/register - Registro de usuarios',
        'POST /api/v1/auth/login - Login de usuarios',
        'GET /api/v1/puc/test - Test del módulo PUC',
        'GET /api/v1/puc/estadisticas - Estadísticas PUC',
        'GET /api/v1/proveedores - Gestión de proveedores',
        'GET /api/v1/productos - Catálogo de productos',
        'GET /api/v1/ordenes-compra - Órdenes de compra'
      ]
    };
  }

  @Get('health')
  @Head('health')
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
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // ✅ ENDPOINT ESPECÍFICO PARA MONITOREO DE RENDER
  @All('ping')
  @ApiOperation({ summary: 'Ping para monitoreo' })
  @ApiResponse({ status: 200, description: 'Pong' })
  ping(@Req() req: Request) {
    console.log(`🏓 ${req.method} /ping - Ping recibido`);
    
    if (req.method === 'HEAD') {
      return;
    }
    
    return { 
      status: 'ok', 
      message: 'pong', 
      timestamp: new Date().toISOString() 
    };
  }
}