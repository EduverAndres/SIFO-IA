// backend-nestjs/src/main.ts - VERSIÓN DE DIAGNÓSTICO
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    console.log('🐛 DEBUG: Iniciando bootstrap...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'], // Logging completo
    });
    
    console.log('🐛 DEBUG: Aplicación NestJS creada exitosamente');
    
    const configService = app.get(ConfigService);

    // 🌐 CORS - CONFIGURACIÓN COMPLETA
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sifo-ia.netlify.app',
      /^https:\/\/.*\.netlify\.app$/,
    ];
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'], // ✅ HEAD agregado
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    console.log('🐛 DEBUG: CORS configurado con soporte para HEAD');

    // 🛠️ VALIDACIONES GLOBALES
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        validateCustomDecorators: true,
        skipMissingProperties: false,
      }),
    );
    
    console.log('🐛 DEBUG: ValidationPipe configurado');

    // 🚀 PREFIJO GLOBAL - COMENTADO TEMPORALMENTE PARA DIAGNÓSTICO
    // app.setGlobalPrefix('api/v1');
    console.log('🐛 DEBUG: Sin prefijo global para diagnóstico');

    // 📚 SWAGGER DOCUMENTACIÓN (simplificado para diagnóstico)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('🐛 SIFO Debug API')
        .setDescription('API de diagnóstico para resolver el problema 404')
        .setVersion('1.0.0')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document); // Sin prefijo
      
      console.log('🐛 DEBUG: Swagger disponible en: /docs');
    }

    // 🔥 INICIAR SERVIDOR
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    console.log('🐛 DEBUG: Servidor iniciado exitosamente');
    logger.log(`🚀 Servidor iniciado en puerto: ${port}`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
    
    // 🏥 ENDPOINTS DE DIAGNÓSTICO
    logger.log(`🐛 DEBUG ENDPOINTS:`);
    logger.log(`🐛 Health check raíz: http://localhost:${port}/`);
    logger.log(`🐛 Test endpoint: http://localhost:${port}/test`);
    logger.log(`🐛 Documentación: http://localhost:${port}/docs`);
    logger.log(`🐛 Auth (si funciona): http://localhost:${port}/auth`);
    
    // Mostrar todas las rutas registradas
    const server = app.getHttpServer();
    const router = server._events.request._router;
    if (router && router.stack) {
      console.log('🐛 DEBUG: Rutas registradas:');
      router.stack.forEach((layer: any) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          console.log(`🐛   ${methods} ${layer.route.path}`);
        }
      });
    }
    
  } catch (error) {
    logger.error('💥 Error crítico al iniciar servidor:', error);
    console.error('🐛 DEBUG: Error completo:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Error en bootstrap:', error);
  console.error('🐛 DEBUG: Stack trace completo:', error.stack);
  process.exit(1);
});