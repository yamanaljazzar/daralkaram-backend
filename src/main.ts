import helmet from 'helmet';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { LoggerService } from './core/services';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const clientUrl = configService.get<string>('app.clientUrl');
  const port = configService.get<number>('app.port') || 3000;
  const corsOrigins = configService.get<string[]>('cors.origin') || ['http://localhost:3000'];
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          connectSrc: ["'self'"],
          defaultSrc: ["'self'"],
          fontSrc: ["'self'"],
          frameSrc: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        includeSubDomains: true,
        maxAge: 31536000,
        preload: true,
      },
    }),
  );

  app.enableCors({
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    origin: corsOrigins,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // Get logger service and log application startup
  const logger = app.get(LoggerService);

  await app.listen(port);
  logger.log(`🚀 Application is running on: ${clientUrl}/api/v1`, 'Bootstrap');
}
bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
