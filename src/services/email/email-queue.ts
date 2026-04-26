import { Queue } from "bullmq";
import { SendTemplateEmailParams } from "./types";
import { logger } from "../../utils/logger";
import { redisClient } from "../../config/redis";
import { ZohoEmailService } from "./zoho-email";

const isDev = process.env.NODE_ENV !== 'production';

export const EMAIL_QUEUE_NAME = process.env.EMAIL_QUEUE_NAME || "email-queue";

const emailQueue = redisClient
  ? new Queue<SendTemplateEmailParams>(EMAIL_QUEUE_NAME, { connection: redisClient })
  : null;

export async function enqueueEmail(payload: SendTemplateEmailParams) {
  if (isDev) {
    logger.info("Dev mode: sending email directly without queue", {
      templateId: payload.templateId,
      to: payload.to.map((r) => r.email),
    });
    const emailService = new ZohoEmailService();
    await emailService.sendTemplateEmail(payload);
    return;
  }

  await emailQueue!.add("send-template-email", payload, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });

  logger.info("Email job enqueued", {
    templateId: payload.templateId,
    to: payload.to.map((r) => r.email),
  });
}
