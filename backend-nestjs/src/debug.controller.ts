// backend-nestjs/src/debug.controller.ts
import { Controller, Get, Head, All, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller() // Sin prefijo - maneja la ruta raíz
export class DebugController {
  
  @All() // Maneja TODOS los métodos HTTP en la ruta raíz
  handleRoot(@Req() req: Request) {
    console.log(`🐛 DEBUG: ${req.method} ${req.path} - Solicitud recibida`);
    console.log(`🐛 Headers:`, req.headers);
    console.log(`🐛 User-Agent:`, req.get('User-Agent'));
    
    // Para HEAD, solo responder con status 200
    if (req.method === 'HEAD') {
      console.log('🐛 Respondiendo HEAD con status 200');
      return;
    }
    
    return {
      success: true,
      message: 'DebugController funcionando',
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')
    };
  }
  
  @All('test') 
  test(@Req() req: Request) {
    console.log(`🐛 TEST: ${req.method} /test`);
    
    if (req.method === 'HEAD') {
      return;
    }
    
    return {
      message: 'Test endpoint funcionando',
      method: req.method,
      timestamp: new Date().toISOString()
    };
  }
}