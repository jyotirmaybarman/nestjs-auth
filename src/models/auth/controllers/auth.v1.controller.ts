import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { AuthV1Service } from '../services/auth.v1.service';

@Controller('/api/v1/auth/')
export class AuthV1Controller {
  constructor(private readonly authService: AuthV1Service) {}

  @Post('register')
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }
}
