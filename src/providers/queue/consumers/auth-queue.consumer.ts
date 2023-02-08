import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES, EVENTS } from '../queues.constant';
import { AuthV1Service } from '../../../models/auth/services/auth.v1.service';

@Processor(QUEUES.AUTH_QUEUE)
export class AuthQueueConsumer {
  constructor(private readonly authService: AuthV1Service) {}

  @Process()
  async process(job: Job<{ event: string; data: any }>) {
    if (job.data.event === EVENTS.SEND_VERIFICATION_EMAIL) {
      return await this.authService.sendVerificationEmail(job.data.data);
    }
  }
}
