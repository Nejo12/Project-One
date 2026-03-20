import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  StoredObjectListResponse,
  StoredObjectResponse,
  StoredObjectView,
} from './storage.contract';
import { StorageClientService } from './storage-client.service';
import { StorageRepository } from './storage.repository';
import {
  StoredObjectRecord,
  UploadedBinaryFile,
  UploadObjectParams,
} from './storage.types';

const maxPhotoUploadSizeBytes = 8 * 1024 * 1024;

@Injectable()
export class StorageService {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly storageClientService: StorageClientService,
  ) {}

  async listPhotoUploads(userId: string): Promise<StoredObjectListResponse> {
    const objects =
      await this.storageRepository.findPhotoUploadsByUserId(userId);

    return {
      objects: objects.map((object) => this.toStoredObjectView(object)),
    };
  }

  async uploadPhoto(
    userId: string,
    file: UploadedBinaryFile | undefined,
  ): Promise<StoredObjectResponse> {
    if (!file) {
      throw new BadRequestException('A photo file is required.');
    }

    this.assertPhotoUpload(file);

    const objectId = randomUUID();
    const objectKey = this.buildPhotoObjectKey(userId, objectId, file);
    const bucket = process.env.S3_BUCKET ?? 'moments-dev';
    const checksumSha256 = createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    const uploadParams: UploadObjectParams = {
      bucket,
      objectKey,
      body: file.buffer,
      contentType: file.mimetype,
    };

    try {
      await this.storageClientService.uploadObject(uploadParams);
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Object storage upload failed: ${error.message}`
          : 'Object storage upload failed.',
      );
    }

    const object = await this.storageRepository.createStoredObject({
      id: objectId,
      userId,
      kind: 'PHOTO_UPLOAD',
      bucket,
      objectKey,
      originalFilename: file.originalname,
      contentType: file.mimetype,
      sizeBytes: file.size,
      checksumSha256,
    });

    return {
      object: this.toStoredObjectView(object),
    };
  }

  private assertPhotoUpload(file: UploadedBinaryFile): void {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are supported.');
    }

    if (file.size <= 0) {
      throw new BadRequestException('Uploaded photo is empty.');
    }

    if (file.size > maxPhotoUploadSizeBytes) {
      throw new BadRequestException('Photo uploads must be 8 MB or smaller.');
    }
  }

  private buildPhotoObjectKey(
    userId: string,
    objectId: string,
    file: UploadedBinaryFile,
  ): string {
    const extension = file.originalname.includes('.')
      ? `.${file.originalname.split('.').pop()!.toLowerCase()}`
      : '';

    return `uploads/users/${userId}/photos/${objectId}${extension}`;
  }

  private toStoredObjectView(object: StoredObjectRecord): StoredObjectView {
    return {
      id: object.id,
      kind: object.kind,
      originalFilename: object.originalFilename,
      contentType: object.contentType,
      sizeBytes: object.sizeBytes,
      createdAt: object.createdAt.toISOString(),
      updatedAt: object.updatedAt.toISOString(),
    };
  }
}
