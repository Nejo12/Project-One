import { Injectable } from '@nestjs/common';
import {
  FulfillmentStatusSyncResponse,
  FulfillmentSubmissionResponse,
} from './fulfillment.contract';
import { PrintProviderService } from './print-provider.service';
import { FulfillmentRepository } from './fulfillment.repository';

const defaultFulfillmentBatchSize = 10;

@Injectable()
export class FulfillmentService {
  constructor(
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly printProviderService: PrintProviderService,
  ) {}

  async submitPaidOrders(
    limit = defaultFulfillmentBatchSize,
  ): Promise<FulfillmentSubmissionResponse> {
    const candidates =
      await this.fulfillmentRepository.listOrdersPendingSubmission(limit);
    let claimedOrders = 0;
    let submittedOrders = 0;
    let failedOrders = 0;

    for (const order of candidates) {
      const claimed = await this.fulfillmentRepository.claimOrderForSubmission(
        order.id,
      );
      if (!claimed) {
        continue;
      }

      claimedOrders += 1;

      const result = await this.printProviderService.submitOrder(order);
      if (result.ok) {
        await this.fulfillmentRepository.recordProviderLog({
          orderId: order.id,
          userId: order.userId,
          providerName: result.success.providerName,
          requestPayload: result.success.requestPayload,
          responsePayload: result.success.responsePayload,
          succeeded: true,
        });
        await this.fulfillmentRepository.markSubmitted({
          orderId: order.id,
          providerName: result.success.providerName,
          providerOrderReference: result.success.providerOrderReference,
          providerAssetReference: result.success.providerAssetReference,
        });
        submittedOrders += 1;
        continue;
      }

      await this.fulfillmentRepository.recordProviderLog({
        orderId: order.id,
        userId: order.userId,
        providerName: result.failure.providerName,
        requestPayload: result.failure.requestPayload,
        responsePayload: result.failure.responsePayload,
        succeeded: false,
      });
      await this.fulfillmentRepository.markFailed({
        orderId: order.id,
        errorMessage: result.failure.errorMessage,
      });
      failedOrders += 1;
    }

    return {
      claimedOrders,
      submittedOrders,
      failedOrders,
    };
  }

  async syncSubmittedOrders(
    limit = defaultFulfillmentBatchSize,
  ): Promise<FulfillmentStatusSyncResponse> {
    const candidates =
      await this.fulfillmentRepository.listOrdersPendingSync(limit);
    let updatedOrders = 0;
    let fulfilledOrders = 0;
    let failedOrders = 0;

    for (const order of candidates) {
      const result = await this.printProviderService.syncOrderStatus(order);

      if (result.ok) {
        await this.fulfillmentRepository.recordProviderLog({
          orderId: order.id,
          userId: order.userId,
          providerName: result.success.providerName,
          requestPayload: result.success.requestPayload,
          responsePayload: result.success.responsePayload,
          succeeded: true,
        });
        await this.fulfillmentRepository.applyProviderStatus({
          orderId: order.id,
          providerFulfillmentStatus: result.success.providerFulfillmentStatus,
          shipmentTrackingNumber: result.success.shipmentTrackingNumber,
          shipmentTrackingUrl: result.success.shipmentTrackingUrl,
        });
        updatedOrders += 1;

        if (result.success.providerFulfillmentStatus === 'DELIVERED') {
          fulfilledOrders += 1;
        }

        if (result.success.providerFulfillmentStatus === 'FAILED') {
          failedOrders += 1;
        }

        continue;
      }

      await this.fulfillmentRepository.recordProviderLog({
        orderId: order.id,
        userId: order.userId,
        providerName: result.failure.providerName,
        requestPayload: result.failure.requestPayload,
        responsePayload: result.failure.responsePayload,
        succeeded: false,
      });

      if (result.failure.retryable) {
        await this.fulfillmentRepository.markSyncError({
          orderId: order.id,
          errorMessage: result.failure.errorMessage,
        });
      } else {
        await this.fulfillmentRepository.applyProviderStatus({
          orderId: order.id,
          providerFulfillmentStatus: 'FAILED',
          shipmentTrackingNumber: null,
          shipmentTrackingUrl: null,
          errorMessage: result.failure.errorMessage,
        });
        failedOrders += 1;
      }
    }

    return {
      checkedOrders: candidates.length,
      updatedOrders,
      fulfilledOrders,
      failedOrders,
    };
  }
}
