// backend-nestjs/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common'; // Ya no lo necesitamos si lo comentamos

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Asegúrate de que esta sea la URL de tu frontend React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // COMENTA O ELIMINA LAS SIGUIENTES LÍNEAS para deshabilitar TODAS las validaciones globales.
  // Esto hará que NestJS acepte cualquier JSON que le envíes en el @Body().
  /*
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, // Esto es lo que causa "property email should not exist"
    transform: true,
  }));
  */

  await app.listen(3001); // Puerto del backend
}
bootstrap();