import { ShippingTypeValue } from '../pricing/pricing.contract';

export interface CreateCheckoutSessionRequestBody {
  shippingType: ShippingTypeValue;
}

export interface CheckoutSessionResponse {
  orderId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  expiresAt: string | null;
}

export interface StripeWebhookResponse {
  received: true;
}
