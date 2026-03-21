import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

export interface StripeCheckoutLineItem {
  label: string;
  amountCents: number;
}

export interface CreateHostedCheckoutSessionParams {
  orderId: string;
  headline: string;
  successUrl: string;
  cancelUrl: string;
  currency: string;
  lineItems: StripeCheckoutLineItem[];
  metadata: Record<string, string>;
}

@Injectable()
export class StripeClientService {
  private readonly stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is required.');
    }

    this.stripe = new Stripe(secretKey);
  }

  createHostedCheckoutSession(
    params: CreateHostedCheckoutSessionParams,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      line_items: params.lineItems.map((lineItem) => ({
        quantity: 1,
        price_data: {
          currency: params.currency.toLowerCase(),
          unit_amount: lineItem.amountCents,
          product_data: {
            name: lineItem.label,
          },
        },
      })),
      metadata: params.metadata,
      payment_intent_data: {
        metadata: params.metadata,
      },
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is required.',
      );
    }

    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }
}
