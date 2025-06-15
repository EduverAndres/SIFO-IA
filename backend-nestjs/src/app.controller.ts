// backend-nestjs/src/app.controller.ts
import { Controller, Get, Head, All, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Request } from 'express';

@ApiTags('🏠 Sistema')
@Controller() // Sin prefijo - maneja la ruta raíz
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ✅ MANEJA TODOS LOS MÉTODOS EN LA RUTA RAÍZ
  @All()
  @ApiOperation({ summary: 'Health check del sistema' })
  @ApiResponse({ status: 200, description: 'Sistema funcionando correctamente' })
  handleRoot(@Req() req: Request) {
    const method = req.method;
    console.log(`🎯 ${method} / - Health check solicitado`);
    
    // Para peticiones HEAD, solo responder con status 200
    if (method === 'HEAD') {
      return;
    }
    
    // Para GET y otros métodos
    return {
      success: true,
      message: 'Sistema SIFO - Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      method: method,
      endpoints: [
        'GET / - Health check raíz',
        'HEAD / - Health check para monitoreo', 
        'GET /api/v1/puc/estadisticas - Estadísticas PUC',
        'GET /api/v1/puc/arbol - Árbol jerárquico',
        'GET /api/v1/auth/login - Login',
        'GET /api/docs - Documentación'
      ]
    };
  }

  @All('health')
  @ApiOperation({ summary: 'Health check detallado' })
  @ApiResponse({ status: 200, description: 'Estado del sistema' })
  getHealth(@Req() req: Request) {
    console.log(`🏥 ${req.method} /health`);
    
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

  @All('ping')
  @ApiOperation({ summary: 'Ping para monitoreo' })
  @ApiResponse({ status: 200, description: 'Pong' })
  ping(@Req() req: Request) {
    console.log(`🏓 ${req.method} /ping`);
    
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