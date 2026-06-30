import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();
dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(process.cwd(), '../../.env') });

import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { initializeOpenTelemetry } from './core/observability/opentelemetry';

initializeOpenTelemetry();

async function bootstrap() {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (
    this: bigint,
  ) {
    return this.toString();
  };

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });
  const logger = app.get(Logger);
  const configService = app.get(ConfigService);

  app.useLogger(logger);

  const corsOrigins = configService.get<string[]>('cors.origins') ?? [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('port', 3001);
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
void bootstrap();
