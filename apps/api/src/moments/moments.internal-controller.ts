import {
  Controller,
  Headers,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { DraftMaterializationResponse } from './moments.contract';
import { MomentsService } from './moments.service';

@Controller('internal/drafts')
export class MomentsInternalController {
  constructor(private readonly momentsService: MomentsService) {}

  @Post('materialize-due')
  materializeDueDrafts(
    @Headers('x-internal-worker-token') receivedToken: string | undefined,
  ): Promise<DraftMaterializationResponse> {
    this.assertInternalWorkerToken(receivedToken);
    return this.momentsService.materializeDueDrafts();
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
