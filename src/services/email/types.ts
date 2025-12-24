export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  name: string;
  content: string; // Base64 encoded
  mime_type: string;
}

export interface SendTemplateEmailParams {
  templateId: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  mergeInfo?: Record<string, any>;
  attachments?: EmailAttachment[];
}
