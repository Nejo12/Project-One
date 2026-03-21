import { requestJson } from "@/lib/api-client";
import { CheckoutSessionResponse, CreateCheckoutSessionRequestBody } from "@/lib/payments-contract";

export function createCheckoutSession(
  accessToken: string,
  orderId: string,
  body: CreateCheckoutSessionRequestBody,
): Promise<CheckoutSessionResponse> {
  return requestJson<CheckoutSessionResponse>(`/orders/${orderId}/checkout-session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}
