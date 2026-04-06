import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger UI
  const config = new DocumentBuilder()
    .setTitle('CampusConnect API')
    .setDescription(
      'Üniversite öğrenci toplulukları için etkinlik platformu REST API. ' +
      'Bu API, kullanıcı yönetimi, etkinlik CRUD işlemleri, JWT tabanlı kimlik doğrulama ' +
      've webhook entegrasyonları sağlar.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token giriniz',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Kimlik doğrulama işlemleri')
    .addTag('Users', 'Kullanıcı CRUD işlemleri')
    .addTag('Events', 'Etkinlik CRUD işlemleri')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 CampusConnect NestJS servisi http://localhost:${port} adresinde çalışıyor`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
}

bootstrap();
