import { Module } from '@nestjs/common';
import { FulfillmentInternalController } from './fulfillment.internal-controller';
import { FulfillmentRepository } from './fulfillment.repository';
import { FulfillmentService } from './fulfillment.service';
import { PrintProviderService } from './print-provider.service';

@Module({
  controllers: [FulfillmentInternalController],
  providers: [FulfillmentRepository, FulfillmentService, PrintProviderService],
})
export class FulfillmentModule {}
