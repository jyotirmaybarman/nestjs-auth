import { ISendMailOptions } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { QUEUES, TASKS } from '../queue.constant';

@Injectable()
export class DefaultQueueProducer {
  constructor(@InjectQueue(QUEUES.DEFAULT_QUEUE) private defaultQueue: Queue) {}

  async queueSendEmail(data: ISendMailOptions) {
    return await this.defaultQueue.add({
      task: TASKS.SEND_EMAIL,
      data,
    });
  }
}
