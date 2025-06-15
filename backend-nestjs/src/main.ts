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
    const httpAdapter = app.getHttpAdapter();
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