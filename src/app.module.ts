import { Module } from '@nestjs/common';
import { PrismaModule } from './providers/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule]
})
export class AppModule {}
