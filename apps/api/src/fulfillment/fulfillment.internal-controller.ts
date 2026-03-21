import {
  Controller,
  Headers,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { FulfillmentSubmissionResponse } from './fulfillment.contract';
import { FulfillmentService } from './fulfillment.service';

@Controller('internal/fulfillment')
export class FulfillmentInternalController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Post('submit-paid-orders')
  submitPaidOrders(
    @Headers('x-internal-worker-token') receivedToken: string | undefined,
  ): Promise<FulfillmentSubmissionResponse> {
    this.assertInternalWorkerToken(receivedToken);
    return this.fulfillmentService.submitPaidOrders();
  }

  private assertInternalWorkerToken(receivedToken: string | undefined): void {
    const expectedToken = process.env.INTERNAL_WORKER_TOKEN;

    if (!expectedToken) {
      throw new ServiceUnavailableException(
        'INTERNAL_WORKER_TOKEN is not configured.',
      );
    }

    if (!receivedToken) {
      throw new UnauthorizedException('Missing internal worker token.');
    }

    const expectedBuffer = Buffer.from(expectedToken);
    const receivedBuffer = Buffer.from(receivedToken);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new UnauthorizedException('Invalid internal worker token.');
    }
  }
}
