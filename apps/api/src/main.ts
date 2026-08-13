import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  // Every route lives under /api/v1 (docs/API.md).
  app.setGlobalPrefix('api/v1');

  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3011')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.API_PORT ?? 3010);
  await app.listen(port);
  Logger.log(`Silence API listening on http://localhost:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
