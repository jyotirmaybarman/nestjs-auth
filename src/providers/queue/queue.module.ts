import { Module, Global } from '@nestjs/common';
import { DefaultQueueProducer } from './producers/default.producer';
import { DefaultQueueConsumer } from './consumers/default.consumer';
import { EmailService } from '../email/email.service';
import { BullModule } from '@nestjs/bull';
import { QUEUES } from 'src/providers/queue/queue.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: QUEUES.DEFAULT_QUEUE,
    }),
  ],
  providers: [DefaultQueueProducer, DefaultQueueConsumer, EmailService],
  exports: [EmailService, DefaultQueueProducer, DefaultQueueConsumer],
})
export class QueueModule {}
