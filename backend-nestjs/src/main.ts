// backend-nestjs/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// backend-nestjs/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://sifo-ia.netlify.app',
      /^https:\/\/.*\.netlify\.app$/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0'); // ← CAMBIO CLAVE
  
  console.log(`🚀 Backend corriendo en puerto: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
}
bootstrap();