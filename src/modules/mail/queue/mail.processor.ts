import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { PayloadMailJob } from '../mail.service';
@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailerService) {
    super();
  }

  async process(job: Job<PayloadMailJob>) {
    const { to, subject, template, context } = job.data;
    await this.mailService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
