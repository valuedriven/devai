import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
