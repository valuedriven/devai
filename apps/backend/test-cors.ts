import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const dotenv = require('dotenv');
  const { join } = require('path');
  dotenv.config();
  dotenv.config({ path: join(process.cwd(), '.env') });
  dotenv.config({ path: join(process.cwd(), '../../.env') });
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  console.log('CORS_ORIGINS:', configService.get('cors.origins'));
  await app.close();
}
bootstrap();
