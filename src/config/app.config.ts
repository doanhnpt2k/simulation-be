import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
}

export default registerAs<AppConfig>('app', () => ({
  port: parseInt(process.env.APP_PORT || '0'),
}));
