import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { RolesGuard } from './auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  dotenv.config({ path: join(__dirname, '..', '.env') });
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(
  //   new JwtAuthGuard(reflector), // Защита через JWT
  //   new RolesGuard(reflector),   // Защита через роли
  // );

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: { target: false }
  }));
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  app.enableCors({
    origin: 'https://lavanda-ptz.onrender.com',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Florist Product API')
    .setDescription('API documentation for product operations')
    .setVersion('1.0')
    .addTag('admin-products')
    .addTag('products')
    .addTag('favorites')
    .addTag('cart')
    .addTag('auth')
    .addTag('users')
    .addTag('order')
    .addBearerAuth()
    .build();

  console.log('process.env:', process.env);
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });


  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}

bootstrap();
