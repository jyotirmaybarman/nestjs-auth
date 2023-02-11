import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { DefaultQueueProducer } from '../queue/producers/default.producer';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly defaultQueueProducer: DefaultQueueProducer,
  ) {}

  async queueSendMail(data: ISendMailOptions) {
    return await this.defaultQueueProducer.queueSendEmail(data);
  }

  async processSendMail(data: ISendMailOptions) {
    return await this.mailerService.sendMail(data)
  }
}
