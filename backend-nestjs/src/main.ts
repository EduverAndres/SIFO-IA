// backend-nestjs/src/main.ts - DESDE CERO
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // 🌐 CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://sifo-ia.netlify.app',
        /^https:\/\/.*\.netlify\.app$/,
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    });

    // 🛠️ VALIDACIÓN
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // 🏥 HEALTH CHECK MANUAL PARA RENDER
    const httpAdapter = app.getHttpAdapter();
    
    // Ruta raíz para monitoreo de Render
    httpAdapter.get('/', (req: any, res: any) => {
      res.json({
        success: true,
        message: 'Sistema SIFO funcionando',
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: '/api/v1/auth/*',
          puc: '/api/v1/puc/*'
        }
      });
    });

    httpAdapter.head('/', (req: any, res: any) => {
      res.status(200).end();
    });

    // 🚀 PREFIJO GLOBAL
    app.setGlobalPrefix('api/v1');

    // 📚 SWAGGER
    const config = new DocumentBuilder()
      .setTitle('SIFO API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // 🔥 INICIAR
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 Servidor iniciado en puerto ${port}`);
    logger.log(`📖 Docs: http://localhost:${port}/api/docs`);
    logger.log(`🔐 Auth: http://localhost:${port}/api/v1/auth/login`);
    logger.log(`🏛️ PUC: http://localhost:${port}/api/v1/puc/test`);
    
  } catch (error) {
    logger.error('💥 Error:', error);
    process.exit(1);
  }
}

bootstrap();