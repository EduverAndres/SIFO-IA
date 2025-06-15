// backend-nestjs/src/main.ts - VERSIÓN LIMPIA FINAL
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
      logger: ['log', 'error', 'warn'],
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
    
    console.log('✅ CORS configurado');

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

    // 🏥 RUTAS RAÍZ MANUALES (para monitoreo de Render)
    const httpAdapter = app.getHttpAdapter();
    
    httpAdapter.get('/', (req: any, res: any) => {
      console.log(`🎯 GET / - Health check`);
      res.json({
        success: true,
        message: 'Sistema SIFO - Backend funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          auth: [
            'POST /auth/login (redirige a /api/v1/auth/login)',
            'POST /auth/register (redirige a /api/v1/auth/register)'
          ],
          puc: [
            'GET /puc/estadisticas (redirige a /api/v1/puc/estadisticas)',
            'GET /puc/arbol (redirige a /api/v1/puc/arbol)',
            'GET /puc/cuentas (redirige a /api/v1/puc/cuentas)'
          ],
          api: [
            'GET /api/v1/puc/* (rutas directas)',
            'POST /api/v1/auth/* (rutas directas)'
          ],
          docs: [
            'GET /api/docs - Documentación Swagger'
          ]
        }
      });
    });

    httpAdapter.head('/', (req: any, res: any) => {
      console.log(`🎯 HEAD / - Health check para monitoreo`);
      res.status(200).end();
    });

    httpAdapter.get('/health', (req: any, res: any) => {
      console.log(`🏥 GET /health`);
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

    // 🔐 RUTAS DE AUTH SIN PREFIJO (para compatibilidad con frontend)
    httpAdapter.post('/auth/login', (req: any, res: any, next: any) => {
      console.log('🔐 POST /auth/login - Redirigiendo a /api/v1/auth/login');
      // Cambiar la URL y continuar con el middleware de NestJS
      req.url = '/api/v1/auth/login';
      req.originalUrl = '/api/v1/auth/login';
      next();
    });

    httpAdapter.post('/auth/register', (req: any, res: any, next: any) => {
      console.log('🔐 POST /auth/register - Redirigiendo a /api/v1/auth/register');
      req.url = '/api/v1/auth/register';
      req.originalUrl = '/api/v1/auth/register';
      next();
    });

    httpAdapter.get('/auth/profile', (req: any, res: any, next: any) => {
      console.log('🔐 GET /auth/profile - Redirigiendo a /api/v1/auth/profile');
      req.url = '/api/v1/auth/profile';
      req.originalUrl = '/api/v1/auth/profile';
      next();
    });

    // También agregar soporte para OPTIONS (preflight CORS)
    httpAdapter.options('/auth/*', (req: any, res: any) => {
      console.log('🔐 OPTIONS /auth/* - CORS preflight');
      res.status(204).end();
    });

    console.log('✅ Rutas de auth sin prefijo registradas (redirección)');

    // 🏛️ RUTAS DE PUC SIN PREFIJO (para compatibilidad con frontend)
    httpAdapter.get('/puc/estadisticas', (req: any, res: any, next: any) => {
      console.log('🏛️ GET /puc/estadisticas - Redirigiendo a /api/v1/puc/estadisticas');
      req.url = '/api/v1/puc/estadisticas';
      req.originalUrl = '/api/v1/puc/estadisticas';
      next();
    });

    httpAdapter.get('/puc/arbol', (req: any, res: any, next: any) => {
      console.log('🏛️ GET /puc/arbol - Redirigiendo a /api/v1/puc/arbol');
      req.url = '/api/v1/puc/arbol';
      req.originalUrl = '/api/v1/puc/arbol';
      next();
    });

    httpAdapter.get('/puc/cuentas', (req: any, res: any, next: any) => {
      console.log('🏛️ GET /puc/cuentas - Redirigiendo a /api/v1/puc/cuentas');
      req.url = '/api/v1/puc/cuentas';
      req.originalUrl = '/api/v1/puc/cuentas';
      next();
    });

    httpAdapter.post('/puc/cuentas', (req: any, res: any, next: any) => {
      console.log('🏛️ POST /puc/cuentas - Redirigiendo a /api/v1/puc/cuentas');
      req.url = '/api/v1/puc/cuentas';
      req.originalUrl = '/api/v1/puc/cuentas';
      next();
    });

    httpAdapter.get('/puc/test', (req: any, res: any, next: any) => {
      console.log('🏛️ GET /puc/test - Redirigiendo a /api/v1/puc/test');
      req.url = '/api/v1/puc/test';
      req.originalUrl = '/api/v1/puc/test';
      next();
    });

    // Ruta catch-all para PUC con parámetros
    httpAdapter.all('/puc/*', (req: any, res: any, next: any) => {
      const originalPath = req.url;
      const newPath = req.url.replace('/puc/', '/api/v1/puc/');
      console.log(`🏛️ ${req.method} ${originalPath} - Redirigiendo a ${newPath}`);
      req.url = newPath;
      req.originalUrl = newPath;
      next();
    });

    console.log('✅ Rutas de PUC sin prefijo registradas (redirección)');

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
    logger.log(`🌐 CORS habilitado`);
    
    // 🏥 ENDPOINTS PRINCIPALES
    logger.log('📍 ENDPOINTS DISPONIBLES:');
    logger.log(`   🏠 Health: / y /health`);
    logger.log(`   🔐 Auth: /auth/* → /api/v1/auth/*`);
    logger.log(`   🏛️ PUC: /puc/* → /api/v1/puc/*`);
    logger.log(`   🔧 API directa: /api/v1/*`);
    logger.log(`   📖 Docs: /api/docs`);
    
    logger.log('✅ Sistema SIFO listo - Frontend y Backend compatibles');
    
  } catch (error) {
    logger.error('💥 Error crítico al iniciar servidor:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Error fatal en bootstrap:', error);
  process.exit(1);
});