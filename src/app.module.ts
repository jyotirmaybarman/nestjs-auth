import { Module } from '@nestjs/common';
import { PrismaModule } from './providers/database/prisma/prisma.module';
import { UsersModule } from './models/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule]
})
export class AppModule {}
