import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { UploadObjectParams } from './storage.types';

function shouldForcePathStyle(endpoint: string): boolean {
  return endpoint.includes('localhost') || endpoint.includes('127.0.0.1');
}

@Injectable()
export class StorageClientService {
  private readonly s3Client: S3Client;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:9000';

    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint,
      forcePathStyle: shouldForcePathStyle(endpoint),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
      },
    });
  }

  uploadObject(params: UploadObjectParams): Promise<unknown> {
    return this.s3Client.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.objectKey,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
  }
}
