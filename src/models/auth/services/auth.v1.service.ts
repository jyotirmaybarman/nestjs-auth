import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersV1Service } from '../../users/services/users.v1.service';
import { RegisterDto } from '../dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthV1Service {
  constructor(
    private readonly usersService: UsersV1Service,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    let user = await this.usersService.findOne({
      where: {
        email: data.email,
      },
    });
    if (user) throw new BadRequestException('email address already in use');

    // generate verification token
    const verification_token = this.jwt.sign(
      { email: data.email },
      {
        secret: this.configService.get('JWT_VERIFY_EMAIL_SECRET'),
      },
    );

    // hash password with bcrypt
    data.password = await bcrypt.hash(data.password, 13);

    user = await this.usersService.create({
      data: {
        ...data,
        verification_token,
        avatar: `https://avatars.dicebear.com/api/bottts/${data.first_name[0].toLowerCase()}${data.last_name[0].toLowerCase()}.svg`,
        role: Role.USER,
      },
    });
    console.log(user);

    return {
      message: 'registered ! check email for confirmation link',
    };
  }
}
