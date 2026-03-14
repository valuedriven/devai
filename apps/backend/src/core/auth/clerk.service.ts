import { Injectable, Logger } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { CustomersService } from '../../modules/customers/services/customers.service';

@Injectable()
export class ClerkService {
  private readonly clerkClient: any;
  private readonly logger = new Logger(ClerkService.name);

  constructor(private readonly customersService: CustomersService) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!secretKey) {
      this.logger.warn(
        'CLERK_SECRET_KEY is not defined. Token verification will likely fail.',
      );
    }

    this.clerkClient = createClerkClient({
      secretKey,
      publishableKey,
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const session = await this.clerkClient.verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
      });
      return session;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<any> {
    return this.clerkClient.users.getUser(userId);
  }

  async syncUser(userId: string, tenantId: string) {
    try {
      const user = await this.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        'Anonymous';

      if (!email) {
        this.logger.warn(`User ${userId} has no email address. Skipping sync.`);
        return null;
      }

      this.logger.log(`Syncing user ${email} from Clerk...`);
      return await this.customersService.syncCustomer(email, name, tenantId);
    } catch (error) {
      this.logger.error(`Failed to sync user ${userId}`, error);
      throw error;
    }
  }
}
