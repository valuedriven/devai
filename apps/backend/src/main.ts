import * as dotenv from 'dotenv';
import { join } from 'path';

// In Vercel/Production, environment variables are injected directly into process.env.
// dotenv is mainly for local development.
dotenv.config(); 
// Second attempt with hardcoded path for local dev flexibility
try {
  dotenv.config({ path: join(process.cwd(), '.env') });
  dotenv.config({ path: join(process.cwd(), '../../.env') });
} catch (e) {
  // Ignore errors as env might already be set in Vercel
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  (BigInt.prototype as any).toJSON = function (this: bigint) {
    return this.toString();
  };

  console.log('--- Environment Check ---');
  console.log('CLERK_SECRET_KEY present:', !!process.env.CLERK_SECRET_KEY);
  console.log(
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY present:',
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('DIRECT_URL present:', !!process.env.DIRECT_URL);
  console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
  console.log('-------------------------');

  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors();
  app.setGlobalPrefix('v1');
  await app.listen(process.env.BACKEND_PORT ?? 3001);
}
void bootstrap();
