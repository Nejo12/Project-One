import {
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import {
  StoredObjectListResponse,
  StoredObjectResponse,
} from './storage.contract';
import { StorageService } from './storage.service';
import { UploadedBinaryFile } from './storage.types';

@Controller('storage')
@UseGuards(SessionAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('photo-uploads')
  listPhotoUploads(
    @Req() request: AuthenticatedRequest,
  ): Promise<StoredObjectListResponse> {
    return this.storageService.listPhotoUploads(request.authUser!.sub);
  }

  @Post('photo-uploads')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: UploadedBinaryFile | undefined,
  ): Promise<StoredObjectResponse> {
    return this.storageService.uploadPhoto(request.authUser!.sub, file);
  }
}
