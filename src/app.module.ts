import { CacheModule, Module } from '@nestjs/common';
import { PrismaModule } from './providers/database/prisma/prisma.module';
import { UsersModule } from './models/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './models/auth/auth.module';
import { redisStore } from 'cache-manager-ioredis-yet';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        }),
      }),
      isGlobal: true
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          auth: {
            user: configService.get('SMTP_USERNAME'),
            pass: configService.get('SMTP_PASSWORD'),
          },
          from: {
            address: configService.get('SMTP_FROM_ADDRESS'),
            name: configService.get('SMTP_FROM_NAME')
          }
        },
        template:{
          dir: join(__dirname, 'providers', 'emails'),
          adapter: new HandlebarsAdapter(),
          options:{
            strict: true
          }
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis:{
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        }
      })      
    }),
  ],
})
export class AppModule {}
