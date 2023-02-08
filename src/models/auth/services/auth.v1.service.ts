import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersV1Service } from '../../users/services/users.v1.service';
import { RegisterDto } from '../dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { LoginDto } from '../dtos/login.dto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { JwtPayloadWithRt } from 'src/common/types/jwt-payload-with-rt.type';
import { Cache } from 'cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { ResendVerificationDto } from '../dtos/resend-verification.dto';

@Injectable()
export class AuthV1Service {
  constructor(
    private readonly usersService: UsersV1Service,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private redis: Cache,
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
        expiresIn: '1h',
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

    let verification_link = `${this.configService.get('FRONTEND_VERIFICATION_URL')}${verification_token}`;

    // console.log(user);
    await this.mailerService.sendMail({
      template: 'verify-email',
      to: user.email,
      subject: "Verify your email address",
      context:{
        verification_link,
        contact_email: "contact@developerzilla.com"
      }
    });

    // TODO: move mail sending to a queue

    return {
      message: 'registered ! check email for confirmation link',
    };
  }

  async resendVerificationEmail(data: ResendVerificationDto) {
    const user = await this.usersService.findOne({
      where:{
        email: data.email,
        verified: false,
        verification_token:{
          not: null
        }
      },
      select:{
        verification_token: true,
        email: true
      }
    });
    if(!user) throw new NotFoundException('invalid email address');
    let verification_link = `${this.configService.get('FRONTEND_VERIFICATION_URL')}${user.verification_token}`;
    // TODO: move mail sending to a queue
    await this.mailerService.sendMail({
      template: "verify-email",
      context:{
        verification_link,
        contact_email: "contact@developerzilla.com"
      },
      to: user.email,
      subject: "Verify your email address",
    });

    return {
      message: "email resent successfully"
    }

  }

  async verifyEmail(verification_token: string) {
    let valid: { email: string } = null;
    try {
      valid = await this.jwt.verifyAsync(verification_token, {
        secret: this.configService.get('JWT_VERIFY_EMAIL_SECRET'),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('something went wrong');
    }
    if (!valid) throw new BadRequestException('invalid verification token');

    // update user as verified
    const user = await this.usersService.findOne({
      where: {
        email: valid.email,
        verification_token: {
          not: null,
        },
      },
    });
    if (!user) throw new BadRequestException('invalid verification token');

    await this.usersService.updateOne({
      data: {
        verified: true,
        verification_token: null,
      },
      where: {
        id: user.id,
      },
    });

    return {
      message: 'email address verified, you may login now !',
    };
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findOne({
      where: {
        email: data.email,
        verified: true,
      },
    });

    if (!user) throw new BadRequestException('invalid username or password');

    // check password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new BadRequestException('invalid username or password');

    // generate tokens
    let refresh_expiry = data.remember
      ? 1000 * 60 * 60 * 24 * 7
      : 1000 * 60 * 60 * 24;
    const refresh_token = this.generateRefreshToken(
      { email: user.email, sub: user.id },
      { expiresIn: refresh_expiry },
    );
    const access_token = this.generateAccessToken(
      { email: user.email, sub: user.id },
      { expiresIn: '15m' },
    );

    // add refresh_token to redis to maintain whitelist
    await this.redis.set(user.id, refresh_token, refresh_expiry);

    return {
      refresh_token,
      access_token,
      message: 'successfully logged in',
    };
  }

  async getLoggedInProfile(user: JwtPayload) {
    const profile = await this.usersService.findOne({
      where: {
        id: user.sub,
      },
    });

    if (!profile) throw new NotFoundException('user not found');

    return profile;
  }

  async refreshAccessToken(user: JwtPayloadWithRt) {
    const exists = await this.redis.get<string>(user.sub);

    if (!exists || exists != user.refresh_token) {
      throw new UnauthorizedException('invalid refresh token');
    }

    const access_token = this.generateAccessToken(
      { email: user.email, sub: user.sub },
      { expiresIn: '15m' },
    );

    return {
      access_token,
    };
  }

  async logout(user: JwtPayloadWithRt) {
    await this.redis.del(user.sub);
    return {
      message: 'logged out successfully',
    };
  }

  generateRefreshToken(
    data: { sub: string; email: string },
    options?: { expiresIn: string | number },
  ): string {
    let refresh_token = this.jwt.sign(data, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: options.expiresIn ? options.expiresIn : '7d',
    });
    return refresh_token;
  }

  generateAccessToken(
    data: { sub: string; email: string },
    options?: { expiresIn: number | string },
  ): string {
    let access_token = this.jwt.sign(data, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: options.expiresIn ? options.expiresIn : '10m',
    });
    return access_token;
  }
}
