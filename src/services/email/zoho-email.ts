import axios, { AxiosInstance } from 'axios';
import { SendTemplateEmailParams, EmailRecipient } from './types';
import { logger } from '../../utils/logger';

export class ZohoEmailService {
  private client: AxiosInstance;

  constructor() {
    this.validateConfig();

    this.client = axios.create({
      baseURL: process.env.ZEPTOMAIL_API_HOST!,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Zoho-enczapikey ${process.env.ZEPTOMAIL_SEND_MAIL_TOKEN}`,
      },
      timeout: 10000,
    });
  }

  async sendTemplateEmail(params: SendTemplateEmailParams): Promise<void> {
    const {
      templateId,
      to,
      cc,
      bcc,
      mergeInfo = {},
      attachments = [],
    } = params;

    const payload: any = {
      template_key: templateId,
      // bounce_address: process.env.ZEPTOMAIL_BOUNCE_ADDRESS,
      from: {
        address: process.env.ZEPTOMAIL_FROM_ADDRESS,
        name: process.env.ZEPTOMAIL_FROM_NAME,
      },
      to: this.mapRecipients(to),
      merge_info: mergeInfo,
    };

    if (cc?.length) payload.cc = this.mapRecipients(cc);
    if (bcc?.length) payload.bcc = this.mapRecipients(bcc);
    if (attachments.length) payload.attachments = attachments;

    logger.info('Sending email via ZeptoMail', {
      templateId,
      to: to.map((r) => r.email),
      cc: cc?.map((r) => r.email),
      bcc: bcc?.map((r) => r.email),
    });

    try {
      const res = await this.client.post('/email/template', payload);

      logger.info('Email sent successfully', {
        templateId,
        requestId: res.data?.data?.request_id,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        templateId,
        error: (error as any).response?.data || (error as Error).message,
      });
      throw error;
    }
  }

  private mapRecipients(recipients: EmailRecipient[]) {
    return recipients.map(({ email, name }) => ({
      email_address: {
        address: email,
        name: name ?? '',
      },
    }));
  }

  private validateConfig() {
    const required = [
      'ZEPTOMAIL_API_HOST',
      'ZEPTOMAIL_SEND_MAIL_TOKEN',
      'ZEPTOMAIL_FROM_ADDRESS',
      'ZEPTOMAIL_FROM_NAME',
      'ZEPTOMAIL_BOUNCE_ADDRESS',
    ];

    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
  }
}
