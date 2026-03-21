export type EmailDeliveryMode = 'preview' | 'resend';

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag: string;
}

export interface EmailDeliveryResult {
  delivered: boolean;
  providerMessageId: string | null;
}
