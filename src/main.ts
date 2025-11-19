import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    app.use(helmet());
    app.setGlobalPrefix('api/v1');
    app.getHttpAdapter().getInstance().set('trust proxy', 4);

    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );

    app.use(
      bodyParser.json({
        verify: (req: any, res, buf) => {
          req.rawBody = buf;
        },
      }),
    );
    app.use(
      bodyParser.urlencoded({
        extended: true,
        verify: (req: any, res, buf) => {
          req.rawBody = buf;
        },
      }),
    );

    // const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    //   'http://localhost:3000',
    // ];

    app.enableCors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    app.getHttpAdapter().get('/api/v1/health', (req: Request, res: Response) => {
      return res.send('api activated');
    });

    const port = 5000;

    await app.listen(port);
    logger.log(
      `Environment: ${process.env.NODE_ENV || 'development'} && app running on ${port}`,
    );
  } catch (error) {
    logger.error('Error during application bootstrap', error);
    process.exit(1);
  }
}
bootstrap();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
