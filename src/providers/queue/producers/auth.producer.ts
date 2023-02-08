import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { QUEUES, EVENTS } from '../queues.constant';
import { SendEmailDto } from '../../../models/auth/dtos/send-email.dto';

@Injectable()
export class AuthQueueProducer {
  constructor(
    @InjectQueue(QUEUES.AUTH_QUEUE) private authQueue: Queue,
  ) {}

  async queueSendVerificationEmail(data: SendEmailDto) {

    await this.authQueue.add({
        event: EVENTS.SEND_VERIFICATION_EMAIL,
        data
    })

    return {
      message: 'verification email sent',
    };
  }

  async queueResendVerificationEmail(data: SendEmailDto) {

    await this.authQueue.add({
        event: EVENTS.RESEND_VERIFICATION_EMAIL,
        data
    })

    return {
      message: 'verification email sent',
    };
  }
}
