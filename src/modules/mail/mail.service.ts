import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export type PayloadMailJob = {
  to: string;
  subject: string;
  template: string;
  context: {
    name: string;
    token: string;
  };
};

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async sendUserConfirmation(payload: PayloadMailJob) {
    const url = `https://google.com?token=${payload.context.token}`;
    await this.mailQueue.add(
      'send-user-confirmation',
      {
        to: payload.to,
        subject: payload.subject,
        template: payload.template,
        context: {
          name: payload.context.name,
          url,
        },
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    );
  }
}
