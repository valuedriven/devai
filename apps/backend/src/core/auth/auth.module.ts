import { Module, Global } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { CustomersModule } from '../../modules/customers/customers.module';

import { AuthController } from '../../modules/auth/auth.controller';
import { AuthService } from '../../modules/auth/auth.service';

@Global()
@Module({
  imports: [CustomersModule],
  providers: [ClerkService, AuthService],
  controllers: [AuthController],
  exports: [ClerkService, AuthService],
})
export class AuthModule {}
