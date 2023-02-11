import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES, TASKS } from '../queue.constant';
import { EmailService } from '../../email/email.service';

@Processor(QUEUES.DEFAULT_QUEUE)
export class DefaultQueueConsumer {
  constructor(private readonly emailService: EmailService) {}

  @Process()
  async process(job: Job) {
    console.log('Processing job: #' + job.id);
    if (job.data.task === TASKS.SEND_EMAIL) {
      await this.emailService.processSendMail(job.data.data);
    }
    console.log('Processed job: #' + job.id);

    return true;
  }
}
