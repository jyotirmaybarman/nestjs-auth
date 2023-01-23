import { Module } from '@nestjs/common';
import { PrismaModule } from './providers/database/prisma/prisma.module';
import { UsersModule } from './models/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, UsersModule, ConfigModule.forRoot({ isGlobal: true })]
})
export class AppModule {}
