import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  (BigInt.prototype as any).toJSON = function (this: bigint) {
    return this.toString();
  };
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors();
  app.setGlobalPrefix('v1');
  await app.listen(process.env.BACKEND_PORT ?? 3001);
}
void bootstrap();
