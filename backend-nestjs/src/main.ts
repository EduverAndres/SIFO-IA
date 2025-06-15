// backend-nestjs/src/main.ts - VERSIÓN FINAL CON DEBUGGING
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    console.log('🚀 Iniciando aplicación SIFO...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'], // Logging detallado
    });
    
    console.log('✅ Aplicación NestJS creada exitosamente');
    
    const configService = app.get(ConfigService);

    // 🌐 CORS CONFIGURACIÓN
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sifo-ia.netlify.app',
      /^https:\/\/.*\.netlify\.app$/,
    ];
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    console.log('✅ CORS configurado (incluye HEAD)');

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
    
    console.log('✅ ValidationPipe configurado');

    // 🚀 PREFIJO GLOBAL
    app.setGlobalPrefix('api/v1');
    console.log('✅ Prefijo global configurado: api/v1');

    // 🏥 SOLUCIÓN DIRECTA: Registrar ruta raíz manualmente
    const httpAdapter = app.getHttpAdapter();
    
    // Registrar manualmente la ruta raíz para manejar HEAD y GET
    httpAdapter.get('/', (req: any, res: any) => {
      console.log(`🎯 GET / - Health check manual`);
      res.json({
        success: true,
        message: 'Sistema SIFO - Backend funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: [
          'GET / - Health check raíz',
          'GET /api/v1/puc/estadisticas - Estadísticas PUC',
          'GET /api/v1/puc/arbol - Árbol jerárquico',
          'GET /api/v1/auth/login - Login',
          'GET /api/docs - Documentación'
        ]
      });
    });

    httpAdapter.head('/', (req: any, res: any) => {
      console.log(`🎯 HEAD / - Health check manual para monitoreo`);
      res.status(200).end();
    });

    // También registrar /health y /ping
    httpAdapter.get('/health', (req: any, res: any) => {
      console.log(`🏥 GET /health - Health check detallado`);
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      });
    });

    httpAdapter.head('/health', (req: any, res: any) => {
      console.log(`🏥 HEAD /health`);
      res.status(200).end();
    });

    httpAdapter.get('/ping', (req: any, res: any) => {
      console.log(`🏓 GET /ping`);
      res.json({ 
        status: 'ok', 
        message: 'pong', 
        timestamp: new Date().toISOString() 
      });
    });

    httpAdapter.head('/ping', (req: any, res: any) => {
      console.log(`🏓 HEAD /ping`);
      res.status(200).end();
    });

    console.log('✅ Rutas raíz registradas manualmente');

    // 📚 SWAGGER DOCUMENTACIÓN
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('🏛️ Sistema SIFO - API')
        .setDescription('API completa para Sistema SIFO')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      
      console.log('✅ Swagger configurado en: /api/docs');
    }

    // 🔥 INICIAR SERVIDOR
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    console.log('🎉 SERVIDOR INICIADO EXITOSAMENTE');
    logger.log(`🚀 Puerto: ${port}`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🌐 CORS: ${allowedOrigins.join(', ')}`);
    
    // 🏥 ENDPOINTS PRINCIPALES
    logger.log('📍 ENDPOINTS PRINCIPALES:');
    logger.log(`   🏠 Health raíz: / (para monitoreo Render)`);
    logger.log(`   🔧 Health API: /api/v1/`);
    logger.log(`   📖 Docs: /api/docs`);
    logger.log(`   🔐 Auth: /api/v1/auth/*`);
    logger.log(`   🏛️ PUC: /api/v1/puc/*`);
    logger.log(`   👥 Proveedores: /api/v1/proveedores/*`);
    
    // 🐛 DEBUGGING: Mostrar rutas registradas
    console.log('🐛 DEBUGGING: Verificando rutas registradas...');
    
    // Obtener el adaptador HTTP y las rutas
    const instance = httpAdapter.getInstance();
    
    if (instance._router && instance._router.stack) {
      console.log('🐛 Rutas encontradas en Express router:');
      instance._router.stack.forEach((layer: any, index: number) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          console.log(`🐛   ${index + 1}. ${methods} ${layer.route.path}`);
        } else if (layer.name === 'router' && layer.regexp) {
          console.log(`🐛   ${index + 1}. [MIDDLEWARE] ${layer.regexp}`);
        }
      });
    } else {
      console.log('🐛 No se pudo acceder al router de Express');
    }
    
    // Verificar específicamente si la ruta raíz está registrada
    const hasRootRoute = instance._router?.stack?.some((layer: any) => 
      layer.route && (layer.route.path === '/' || layer.route.path === '')
    );
    
    console.log(`🐛 ¿Ruta raíz registrada? ${hasRootRoute ? '✅ SÍ' : '❌ NO'}`);
    
    if (!hasRootRoute) {
      console.error('❌ ERROR: La ruta raíz NO está registrada en Express');
      console.log('🔍 Verificar que AppController esté en app.module.ts');
    }
    
  } catch (error) {
    logger.error('💥 Error crítico al iniciar servidor:', error);
    console.error('🐛 Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Error fatal en bootstrap:', error);
  process.exit(1);
});