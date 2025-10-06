import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transforms payloads to match DTO types
      // skipMissingProperties: false,
      whitelist: true, // no extra properties is allowed
      forbidNonWhitelisted: true, // Throws an error if extra properties exist
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
