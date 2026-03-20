import { StoredObject } from '@prisma/client';

export type StoredObjectRecord = Pick<
  StoredObject,
  | 'id'
  | 'kind'
  | 'originalFilename'
  | 'contentType'
  | 'sizeBytes'
  | 'createdAt'
  | 'updatedAt'
>;

export type CreateStoredObjectParams = Pick<
  StoredObject,
  | 'id'
  | 'userId'
  | 'kind'
  | 'bucket'
  | 'objectKey'
  | 'originalFilename'
  | 'contentType'
  | 'sizeBytes'
  | 'checksumSha256'
>;

export type UploadedBinaryFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type UploadObjectParams = {
  bucket: string;
  objectKey: string;
  body: Buffer;
  contentType: string;
};
