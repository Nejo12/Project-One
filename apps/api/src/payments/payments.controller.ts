import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type {
  CheckoutSessionResponse,
  CreateCheckoutSessionRequestBody,
  StripeWebhookResponse,
} from './payments.contract';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId/checkout-session')
  @UseGuards(SessionAuthGuard)
  createCheckoutSession(
    @Req() request: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Body() body: CreateCheckoutSessionRequestBody,
  ): Promise<CheckoutSessionResponse> {
    return this.paymentsService.createCheckoutSession(
      request.authUser!.sub,
      orderId,
      body,
    );
  }

  @Post('payments/stripe/webhook')
  handleStripeWebhook(@Req() request: Request): Promise<StripeWebhookResponse> {
    return this.paymentsService.handleStripeWebhook(request);
  }
}
