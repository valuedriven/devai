import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

const configFn = () => {
  console.log('Inside configFn, CORS_ORIGINS is:', process.env.CORS_ORIGINS);
  return { test: 'hello' };
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '../../.env'),
      load: [configFn],
    }),
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('Before NestFactory.create, CORS_ORIGINS is:', process.env.CORS_ORIGINS);
  const app = await NestFactory.create(TestModule);
  console.log('After NestFactory.create, CORS_ORIGINS is:', process.env.CORS_ORIGINS);
  await app.close();
}
bootstrap();
