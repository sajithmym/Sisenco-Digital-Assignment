import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { AUTH_SETTINGS, SERVER_SETTINGS, validateRuntimeConfiguration } from './settings';

async function bootstrap() {
  validateRuntimeConfiguration();
  const app = await NestFactory.create(AppModule);

  const { port, publicUrl, frontendUrl, apiPrefix, cors } = SERVER_SETTINGS;

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: cors.methods,
    allowedHeaders: [...cors.allowedHeaders, AUTH_SETTINGS.csrfHeaderName],
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
  console.log(`🚀 Backend running on ${publicUrl}`);
}
bootstrap();
