import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export default registerAs<EmailConfig>('email', () => ({
  host: process.env.MAIL_HOST || '',
  port: parseInt(process.env.MAIL_PORT || '587'),
  user: process.env.MAIL_USER || '',
  pass: process.env.MAIL_PASS || '',
  from: process.env.MAIL_FROM || '',
}));
