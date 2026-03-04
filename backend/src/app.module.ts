import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DatabaseModule } from './database/database.module';
import { TenantInterceptor } from './core/interceptors/tenant.interceptor';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [CatalogModule, CustomersModule, OrdersModule, DatabaseModule, WebhooksModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule { }
