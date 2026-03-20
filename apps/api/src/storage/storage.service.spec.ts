import { StoredObjectRecord } from './storage.types';
import { ServiceUnavailableException } from '@nestjs/common';
import { StorageRepository } from './storage.repository';
import { StorageService } from './storage.service';
import { UploadedBinaryFile } from './storage.types';

class StorageRepositoryFake {
  objects: StoredObjectRecord[] = [
    {
      id: 'stored_object_1',
      kind: 'PHOTO_UPLOAD' as const,
      originalFilename: 'birthday.jpg',
      contentType: 'image/jpeg',
      sizeBytes: 2048,
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
    },
  ];

  createStoredObject(
    params: Parameters<StorageRepository['createStoredObject']>[0],
  ) {
    const object = {
      id: params.id,
      kind: params.kind,
      originalFilename: params.originalFilename ?? null,
      contentType: params.contentType,
      sizeBytes: params.sizeBytes,
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    };
    this.objects.unshift(object);
    return Promise.resolve(object);
  }

  findPhotoUploadsByUserId() {
    return Promise.resolve(this.objects);
  }
}

class StorageClientServiceFake {
  shouldFail = false;

  uploadObject() {
    if (this.shouldFail) {
      return Promise.reject(new Error('bucket unavailable'));
    }

    return Promise.resolve({});
  }
}

describe('StorageService', () => {
  let storageService: StorageService;
  let storageClientService: StorageClientServiceFake;

  beforeEach(() => {
    storageClientService = new StorageClientServiceFake();
    storageService = new StorageService(
      new StorageRepositoryFake() as unknown as StorageRepository,
      storageClientService as never,
    );
  });

  it('lists photo uploads for the current user', async () => {
    const response = await storageService.listPhotoUploads('user_1');

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0]?.kind).toBe('PHOTO_UPLOAD');
  });

  it('uploads a valid image and stores metadata', async () => {
    const file: UploadedBinaryFile = {
      originalname: 'family-photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test-file'),
    };

    const response = await storageService.uploadPhoto('user_1', file);

    expect(response.object.kind).toBe('PHOTO_UPLOAD');
    expect(response.object.originalFilename).toBe('family-photo.jpg');
  });

  it('turns storage upload failures into service errors', async () => {
    storageClientService.shouldFail = true;

    const file: UploadedBinaryFile = {
      originalname: 'family-photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test-file'),
    };

    await expect(
      storageService.uploadPhoto('user_1', file),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
