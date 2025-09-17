import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailConfig } from '@/config/email.config';
import { MailQueueModule } from './queue/mail.queue.module';
@Module({
  imports: [
    ConfigModule,
    MailQueueModule,
    MailerModule.forRootAsync({
      //    imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const mailConfig = config.get<EmailConfig>('email');
        if (!mailConfig) {
          throw new Error('Email config not found');
        }
        return {
          transport: {
            host: mailConfig.host,
            port: mailConfig.port,
            secure: false,
            auth: {
              user: mailConfig.user,
              pass: mailConfig.pass,
            },
          },
          defaults: {
            from: `"No Reply" <${mailConfig.from}>`,
          },
          template: {
            dir: join(process.cwd(), 'src/modules/mail/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
