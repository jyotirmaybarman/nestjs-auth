import { Module } from '@nestjs/common';
import { AuthV1Service } from './services/auth.v1.service';
import { AuthV1Controller } from './controllers/auth.v1.controller';
import { UsersV1Service } from '../users/services/users.v1.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_AUTH_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthV1Service, UsersV1Service],
  controllers: [AuthV1Controller],
})
export class AuthModule {}
