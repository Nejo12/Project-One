import { ShippingTypeValue } from "@/lib/pricing-contract";

export interface CreateCheckoutSessionRequestBody {
  shippingType: ShippingTypeValue;
}

export interface CheckoutSessionResponse {
  orderId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  expiresAt: string | null;
}
