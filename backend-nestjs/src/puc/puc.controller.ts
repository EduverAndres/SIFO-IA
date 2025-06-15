// backend-nestjs/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from '../app.service';

@ApiTags('🏠 Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
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
  getHello() {
    return {
      success: true,
      message: 'Sistema SIFO - Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: [
        'GET /api/v1/ - Health check',
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
  @ApiOperation({ summary: 'Health check detallado' })
  @ApiResponse({ status: 200, description: 'Estado del sistema' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}