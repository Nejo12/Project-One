import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StorageClientService } from './storage-client.service';
import { StorageController } from './storage.controller';
import { StorageRepository } from './storage.repository';
import { StorageService } from './storage.service';

@Module({
  imports: [AuthModule],
  controllers: [StorageController],
  providers: [StorageRepository, StorageService, StorageClientService],
  exports: [StorageService],
})
export class StorageModule {}
