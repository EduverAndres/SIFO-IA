// backend-nestjs/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Iniciando SIFO-IA Backend...');
  
  const app = await NestFactory.create(AppModule);

  // CORS para desarrollo y producción
  app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://sifo-ia.netlify.app',
    /^https:\/\/.*\.netlify\.app$/,
    'https://sifo-ia.onrender.com', // Tu propio backend
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`✅ SIFO-IA Backend funcionando en: http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: Transaction Pooler conectado`);
}

bootstrap();