import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class MbtiS3Service {
  private readonly s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: process.env.AWS_S3_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY,
          secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
        }
      : undefined,
  });

  async upload(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const bucket = process.env.AWS_S3_BUCKET as string;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );
    const baseUrl =
      process.env.AWS_S3_PUBLIC_BASE_URL ||
      `https://${bucket}.s3.amazonaws.com`;
    return `${baseUrl}/${key}`;
  }
}
