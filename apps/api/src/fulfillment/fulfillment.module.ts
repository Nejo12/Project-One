import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { FulfillmentInternalController } from './fulfillment.internal-controller';
import { FulfillmentRepository } from './fulfillment.repository';
import { FulfillmentService } from './fulfillment.service';
import { PrintProviderService } from './print-provider.service';

@Module({
  imports: [NotificationsModule],
  controllers: [FulfillmentInternalController],
  providers: [FulfillmentRepository, FulfillmentService, PrintProviderService],
})
export class FulfillmentModule {}
