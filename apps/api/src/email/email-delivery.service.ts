import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  EmailDeliveryMode,
  EmailDeliveryResult,
  TransactionalEmail,
} from './email.types';

interface ResendEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags: Array<{
    name: string;
    value: string;
  }>;
}

interface ResendEmailResponse {
  id: string;
}

@Injectable()
export class EmailDeliveryService {
  private readonly logger = new Logger(EmailDeliveryService.name);

  async sendTransactionalEmail(
    message: TransactionalEmail,
  ): Promise<EmailDeliveryResult> {
    const mode = this.getDeliveryMode();
    if (mode === 'preview') {
      this.logger.log(
        `Email preview mode active. Skipping provider delivery for tag=${message.tag}.`,
      );

      return {
        delivered: false,
        providerMessageId: null,
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'RESEND_API_KEY is required when EMAIL_DELIVERY_MODE=resend.',
      );
    }

    const from = process.env.EMAIL_FROM;
    if (!from) {
      throw new InternalServerErrorException('EMAIL_FROM is required.');
    }

    const payload: ResendEmailRequest = {
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      tags: [
        {
          name: 'flow',
          value: message.tag,
        },
      ],
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `Resend email delivery failed with status ${response.status}: ${errorBody}`,
      );
    }

    const parsed = this.parseResendResponse(await response.json());
    return {
      delivered: true,
      providerMessageId: parsed.id,
    };
  }

  getDeliveryMode(): EmailDeliveryMode {
    const configuredMode = process.env.EMAIL_DELIVERY_MODE;
    if (configuredMode === 'resend') {
      return 'resend';
    }

    return 'preview';
  }

  private parseResendResponse(input: unknown): ResendEmailResponse {
    if (!this.isResendEmailResponse(input)) {
      throw new InternalServerErrorException(
        'Resend returned an invalid response body.',
      );
    }

    return input;
  }

  private isResendEmailResponse(input: unknown): input is ResendEmailResponse {
    if (typeof input !== 'object' || input === null) {
      return false;
    }

    const record = input as Record<string, unknown>;
    return typeof record.id === 'string' && record.id.length > 0;
  }
}
