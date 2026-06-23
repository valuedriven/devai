import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import * as jwt from 'jsonwebtoken';
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
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      return jwt.verify(token, secret);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async signInternalToken(payload: any): Promise<string> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  async getUser(userId: string): Promise<any> {
    return this.clerkClient.users.getUser(userId);
  }

  async syncUserWithData(user: any) {
    try {
      const email = user.emailAddresses[0]?.emailAddress;
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        'Anonymous';

      if (!email) {
        this.logger.warn(
          `User ${user.id} has no email address. Skipping sync.`,
        );
        return null;
      }

      this.logger.log(`Syncing user ${email} from Clerk...`);
      return await this.customersService.syncCustomer(email, name);
    } catch (error) {
      this.logger.error(`Failed to sync user data for ${user.id}`, error);
      throw error;
    }
  }

  async verifyPassword(email: string, password: string): Promise<any> {
    try {
      // Find user by email
      const users = await this.clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = users[0];

      // Verifying password via Clerk Backend API
      // Note: Clerk SDK might not have a direct "verifyPassword" method in all versions
      // We often use the Backend API or a manual check if we have the password hash (not recommended)
      // For Clerk, the recommended way for a backend-centric flow is usually to use
      // the Backend API to verify credentials if you are not using their UI.

      const response = await this.clerkClient.users.verifyPassword({
        userId: user.id,
        password: password,
      });

      if (!response.verified) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      this.logger.error(`Password verification failed for ${email}`, error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async createUser(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<any> {
    try {
      const newUser = await this.clerkClient.users.createUser({
        emailAddress: [data.email],
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        publicMetadata: {
          roles: data.role ? [data.role] : ['customer'],
        },
      });

      // Sync with local database
      await this.syncUserWithData(newUser);

      return newUser;
    } catch (error) {
      this.logger.error(`Failed to create user ${data.email}`, error);
      throw error;
    }
  }

  static extractRoles(
    publicMetadata: Record<string, unknown> | undefined,
  ): string[] {
    let roles: string[] = [];

    if (!publicMetadata) return ['CUSTOMER'];

    if (Array.isArray(publicMetadata.roles)) {
      roles = publicMetadata.roles;
    } else if (typeof publicMetadata.roles === 'string') {
      roles = [publicMetadata.roles];
    } else if (Array.isArray(publicMetadata.role)) {
      roles = publicMetadata.role;
    } else if (typeof publicMetadata.role === 'string') {
      roles = [publicMetadata.role];
    }

    return roles.length === 0 ? ['CUSTOMER'] : roles;
  }

  async createSignInToken(userId: string): Promise<string> {
    try {
      const tokenResponse =
        await this.clerkClient.signInTokens.createSignInToken({
          userId,
        });
      return tokenResponse.token;
    } catch (error) {
      this.logger.error(`Failed to create sign in token for ${userId}`, error);
      throw error;
    }
  }

  async revokeSession(userId: string): Promise<void> {
    try {
      const sessions = await this.clerkClient.users.getSessions(userId);
      for (const session of sessions) {
        await this.clerkClient.sessions.revokeSession(session.id);
      }
    } catch (error) {
      this.logger.error(`Failed to revoke sessions for ${userId}`, error);
    }
  }
}
