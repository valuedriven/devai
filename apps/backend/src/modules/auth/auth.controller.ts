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

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = req.user;

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.publicMetadata?.roles || [],
      imageUrl: user.imageUrl,
    };
  }
}
