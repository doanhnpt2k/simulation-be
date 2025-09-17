import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [BullModule.registerQueue({ name: 'mail' }), MailerModule],
  providers: [MailProcessor],
  exports: [BullModule],
})
export class MailQueueModule {}
