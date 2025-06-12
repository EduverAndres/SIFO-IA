// backend-nestjs/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 🌐 CORS - CONFIGURACIÓN COMPLETA
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite
      'https://sifo-ia.netlify.app',
      /^https:\/\/.*\.netlify\.app$/,
    ];
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // 🛠️ VALIDACIONES GLOBALES - CONFIGURACIÓN CRÍTICA PARA DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,                    // ✅ Solo permite propiedades definidas en DTOs
        forbidNonWhitelisted: false,        // ✅ CAMBIADO: No rechaza propiedades extra (era true)
        transform: true,                    // ✅ Transforma tipos automáticamente
        transformOptions: {
          enableImplicitConversion: true,   // ✅ Convierte strings a números automáticamente
        },
        disableErrorMessages: false,        // ✅ CAMBIADO: Siempre mostrar errores detallados
        validateCustomDecorators: true,     // ✅ AGREGADO: Valida decoradores personalizados
        skipMissingProperties: false,       // ✅ AGREGADO: No omite propiedades faltantes
      }),
    );

    // 📚 SWAGGER DOCUMENTACIÓN
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('🏛️ Sistema SIFO - API Completa')
        .setDescription(`
          ## API completa para Sistema SIFO
          
          ### Módulos disponibles:
          - 🔐 **Autenticación** - Registro y login de usuarios
          - 🏛️ **PUC** - Plan Único de Cuentas
          - 👥 **Proveedores** - Gestión de proveedores
          - 📦 **Productos** - Catálogo de productos
          - 📋 **Órdenes de Compra** - Gestión de órdenes
          
          ### Endpoints principales:
          - **Auth:** \`/api/v1/auth/login\`, \`/api/v1/auth/register\`
          - **PUC:** \`/api/v1/puc\`
          - **Proveedores:** \`/api/v1/proveedores\`
          
          ### Ejemplos de uso:
          
          **Registro de usuario:**
          \`\`\`json
          POST /api/v1/auth/register
          {
            "username": "usuario123",
            "email": "usuario@ejemplo.com",
            "password": "123456"
          }
          \`\`\`
          
          **Login:**
          \`\`\`json
          POST /api/v1/auth/login
          {
            "email": "usuario@ejemplo.com",
            "password": "123456"
          }
          \`\`\`
        `)
        .setVersion('1.0.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Ingresa el token JWT obtenido del login',
            in: 'header',
          },
          'JWT-auth'
        )
        .addServer('/api/v1', 'API v1')
        .addTag('🔐 Auth', 'Endpoints de autenticación')
        .addTag('🏛️ PUC', 'Plan Único de Cuentas')
        .addTag('👥 Proveedores', 'Gestión de proveedores')
        .addTag('📦 Productos', 'Catálogo de productos')
        .addTag('📋 Órdenes', 'Órdenes de compra')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          docExpansion: 'list',
          filter: true,
          showRequestHeaders: true,
        },
        customSiteTitle: 'SIFO API Documentation',
        customfavIcon: '/favicon.ico',
        customCss: `
          .swagger-ui .topbar { background-color: #1976d2; }
          .swagger-ui .topbar .download-url-wrapper { display: none; }
        `,
      });

      logger.log('📚 Swagger disponible en: /api/docs');
    }

    // 🚀 PREFIJO GLOBAL
    app.setGlobalPrefix('api/v1');

    // 🔥 INICIAR SERVIDOR
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 Servidor iniciado en puerto: ${port}`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
    
    // 🏥 HEALTH CHECK Y ENDPOINTS PRINCIPALES
    logger.log(`🏥 Health check: http://localhost:${port}/api/v1/auth (debería responder)`);
    logger.log(`📖 Documentación: http://localhost:${port}/api/docs`);
    logger.log(`🔐 Auth Register: POST http://localhost:${port}/api/v1/auth/register`);
    logger.log(`🔐 Auth Login: POST http://localhost:${port}/api/v1/auth/login`);
    logger.log(`🏛️ PUC Estadísticas: GET http://localhost:${port}/api/v1/puc/estadisticas`);
    
  } catch (error) {
    logger.error('💥 Error crítico al iniciar servidor:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Error en bootstrap:', error);
  process.exit(1);
});