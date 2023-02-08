import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { AuthV1Service } from '../services/auth.v1.service';
import { LoginDto } from '../dtos/login.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { JwtPayload } from '../../../common/types/jwt-payload.type';
import { RefreshTokenGuard } from '../../../common/guards/refresh-token.guard';
import { Response } from 'express';
import { JwtPayloadWithRt } from 'src/common/types/jwt-payload-with-rt.type';
import { ResendVerificationDto } from '../dtos/resend-verification.dto';

@Controller('/api/v1/auth/')
export class AuthV1Controller {
  constructor(private readonly authService: AuthV1Service) {}

  @Post('register')
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }

  @Post('resend-verification')
  async resendVerificationEmail(@Body() data: ResendVerificationDto) {
    return await this.authService.resendVerificationEmail(data);
  }

  @Post('login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    let result = await this.authService.login(data);

    const expiry = data.remember
      ? 1000 * 60 * 60 * 24 * 7 // 7 days
      : 1000 * 60 * 60 * 24; // 1 day

    return res
      .status(200)
      .cookie('token', result.refresh_token, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + expiry),
        httpOnly: true,
        secure: false,
      })
      .json({
        message: 'Logged in successfully',
        access_token: result.access_token,
      });
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async getLoggedInProfile(@CurrentUser() user: JwtPayload) {
    return await this.authService.getLoggedInProfile(user);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshAccessToken(@CurrentUser() user: JwtPayloadWithRt) {
    return await this.authService.refreshAccessToken(user);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@CurrentUser() user: JwtPayloadWithRt, @Res() res: Response) {
    const result = await this.authService.logout(user);
    return res
      .status(200)
      .cookie('token', null, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(),
        httpOnly: true,
        secure: false,
      })
      .json({
        message: result.message,
        access_token: null,
      });
  }
}
