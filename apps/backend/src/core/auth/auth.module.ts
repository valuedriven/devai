import { Module, Global } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { CustomersModule } from '../../modules/customers/customers.module';

@Global()
@Module({
  imports: [CustomersModule],
  providers: [ClerkService],
  exports: [ClerkService],
})
export class AuthModule {}
