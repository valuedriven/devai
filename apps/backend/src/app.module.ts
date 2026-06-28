import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './core/auth/auth.module';
import { HealthModule } from './core/health/health.module';
import { AuditModule } from './modules/audit/audit.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './core/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '../../../.env'),
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        autoLogging: true,
      },
    }),
    CustomersModule,
    OrdersModule,
    ProductsModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
