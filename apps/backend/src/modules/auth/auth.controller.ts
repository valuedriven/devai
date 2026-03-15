import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ClerkService } from '../../core/auth/clerk.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly clerkService: ClerkService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: any, @Request() req: any) {
    const tenantId = req.headers['x-tenant-id'] || body.tenantId || 'default';
    return this.authService.register({
      ...body,
      tenantId,
    });
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = req.user;

    // Normalizing roles from publicMetadata
    let roles: string[] = [];
    const metadata = user.publicMetadata || {};

    if (Array.isArray(metadata.roles)) {
      roles = metadata.roles;
    } else if (typeof metadata.roles === 'string') {
      roles = [metadata.roles];
    } else if (Array.isArray(metadata.role)) {
      roles = metadata.role;
    } else if (typeof metadata.role === 'string') {
      roles = [metadata.role];
    }

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      imageUrl: user.imageUrl,
    };
  }
}
