import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { LifecycleEmailService } from './lifecycle-email.service';
import { NotificationsRepository } from './notifications.repository';

@Module({
  imports: [EmailModule],
  providers: [NotificationsRepository, LifecycleEmailService],
  exports: [LifecycleEmailService],
})
export class NotificationsModule {}
