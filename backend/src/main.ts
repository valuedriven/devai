import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (BigInt.prototype as any).toJSON = function (this: bigint) {
    return this.toString();
  };
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors();
  app.setGlobalPrefix('v1');
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
