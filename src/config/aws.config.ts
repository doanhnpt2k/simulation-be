import { registerAs } from '@nestjs/config';

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export default registerAs<AwsConfig>('aws', () => ({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY || '',
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_S3_REGION || '',
  bucket: process.env.AWS_S3_BUCKET || '',
}));
