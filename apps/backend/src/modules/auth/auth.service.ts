import { Injectable } from '@nestjs/common';
import { ClerkService } from '../../core/auth/clerk.service';

@Injectable()
export class AuthService {
  constructor(private readonly clerkService: ClerkService) {}

  async login(email: string, password: string) {
    const user = await this.clerkService.verifyPassword(email, password);

    // Create a local JWT for the frontend to use
    const token = await this.clerkService.signInternalToken({
      sub: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    tenantId: string;
  }) {
    const user = await this.clerkService.createUser({
      ...data,
      role: 'customer',
    });

    // Create a local JWT for the frontend to use
    const token = await this.clerkService.signInternalToken({
      sub: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
