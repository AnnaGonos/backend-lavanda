import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as process from 'node:process';

@Injectable()
export class CloudService {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.AWS_ENDPOINT,
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string,
    objectKey: string,
  ): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    await this.s3.upload(params).promise();

    const signedUrlParams = {
      Bucket: bucketName,
      Key: objectKey,
      Expires: 360000000,
    };

    return this.s3.getSignedUrl('getObject', signedUrlParams);
  }
}
