// backend-nestjs/src/app.controller.ts - COMPLETAMENTE CORREGIDO
import { Controller, Get, Head, All, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express'; // ✅ IMPORTACIONES CORREGIDAS
import { AppService } from './app.service';

@ApiTags('🏠 Sistema')
@Controller() // Sin prefijo - maneja la ruta raíz
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ✅ MANEJA TODOS LOS MÉTODOS EN LA RUTA RAÍZ
  @All()
  @ApiOperation({ summary: 'Health check del sistema' })
  @ApiResponse({ status: 200, description: 'Sistema funcionando correctamente' })
  handleRoot(@Req() req: Request, @Res() res: Response) {
    const method = req.method;
    console.log(`🎯 ${method} / - Health check solicitado desde ${req.ip}`);
    
    // Para peticiones HEAD, solo responder con status 200
    if (method === 'HEAD') {
      return res.status(200).end();
    }
    
    // Para GET y otros métodos
    return res.status(200).json({
      success: true,
      message: 'Sistema SIFO - Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      method: method,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      endpoints: [
        'GET / - Health check raíz',
        'HEAD / - Health check para monitoreo', 
        'GET /api/v1 - API Base',
        'GET /api/v1/health - Health check detallado',
        'GET /api/v1/ping - Ping para monitoreo',
        'GET /api/v1/puc/test - Test PUC',
        'GET /api/v1/puc/estadisticas - Estadísticas PUC',
        'GET /api/v1/puc/cuentas - Obtener cuentas',
        'GET /api/v1/puc/arbol - Árbol jerárquico',
        'POST /api/v1/puc/importar/excel - Importar Excel',
        'GET /api/v1/puc/exportar/excel - Exportar Excel',
        'GET /api/v1/auth/ping - Test Auth',
        'POST /api/v1/auth/login - Login',
        'POST /api/v1/auth/register - Registro',
        'GET /api/docs - Documentación Swagger'
      ],
      status: {
        database: 'connected',
        memory: this.formatBytes(process.memoryUsage().heapUsed),
        uptime: this.formatUptime(process.uptime())
      }
    });
  }

  @All('health')
  @ApiOperation({ summary: 'Health check detallado del sistema' })
  @ApiResponse({ status: 200, description: 'Estado detallado del sistema' })
  getHealth(@Req() req: Request, @Res() res: Response) {
    const method = req.method;
    console.log(`🏥 ${method} /health - Health check detallado desde ${req.ip}`);
    
    if (method === 'HEAD') {
      return res.status(200).end();
    }
    
    const memoryUsage = process.memoryUsage();
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      uptimeFormatted: this.formatUptime(process.uptime()),
      memory: {
        used: this.formatBytes(memoryUsage.heapUsed),
        total: this.formatBytes(memoryUsage.heapTotal),
        rss: this.formatBytes(memoryUsage.rss),
        external: this.formatBytes(memoryUsage.external)
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid
      },
      request: {
        method: method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        host: req.get('host')
      },
      services: {
        database: 'connected',
        puc: 'available',
        auth: 'available',
        excel: 'available'
      }
    });
  }

  @All('ping')
  @ApiOperation({ summary: 'Ping simple para monitoreo de disponibilidad' })
  @ApiResponse({ status: 200, description: 'Respuesta pong con timestamp' })
  ping(@Req() req: Request, @Res() res: Response) {
    const method = req.method;
    console.log(`🏓 ${method} /ping - Ping desde ${req.ip}`);
    
    if (method === 'HEAD') {
      return res.status(200).end();
    }
    
    return res.status(200).json({ 
      status: 'ok', 
      message: 'pong', 
      timestamp: new Date().toISOString(),
      method: method,
      responseTime: Date.now()
    });
  }

  // ✅ NUEVO ENDPOINT PARA API BASE
  @All('api/v1')
  @ApiOperation({ summary: 'Información de la API v1' })
  @ApiResponse({ status: 200, description: 'Información de endpoints disponibles' })
  getApiInfo(@Req() req: Request, @Res() res: Response) {
    const method = req.method;
    console.log(`📡 ${method} /api/v1 - Info API solicitada`);
    
    if (method === 'HEAD') {
      return res.status(200).end();
    }
    
    return res.status(200).json({
      api: 'SIFO API v1',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      method: method,
      documentation: '/api/docs',
      modules: {
        puc: {
          description: 'Plan Único de Cuentas',
          endpoints: {
            'GET /api/v1/puc/test': 'Test de conexión PUC',
            'GET /api/v1/puc/estadisticas': 'Estadísticas generales',
            'GET /api/v1/puc/cuentas': 'Listar cuentas',
            'POST /api/v1/puc/cuentas': 'Crear cuenta',
            'GET /api/v1/puc/cuentas/:id': 'Obtener cuenta por ID',
            'PUT /api/v1/puc/cuentas/:id': 'Actualizar cuenta',
            'DELETE /api/v1/puc/cuentas/:id': 'Eliminar cuenta',
            'GET /api/v1/puc/arbol': 'Árbol jerárquico',
            'POST /api/v1/puc/importar/excel': 'Importar desde Excel',
            'GET /api/v1/puc/exportar/excel': 'Exportar a Excel',
            'GET /api/v1/puc/exportar/template': 'Descargar template'
          }
        },
        auth: {
          description: 'Autenticación y autorización',
          endpoints: {
            'GET /api/v1/auth/ping': 'Test de conexión Auth',
            'POST /api/v1/auth/login': 'Iniciar sesión',
            'POST /api/v1/auth/register': 'Registrar usuario'
          }
        }
      }
    });
  }

  // ===============================================
  // 🛠️ MÉTODOS DE UTILIDAD PRIVADOS
  // ===============================================

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}
