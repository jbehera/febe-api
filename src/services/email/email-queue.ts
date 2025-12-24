import { Queue } from "bullmq";
import { SendTemplateEmailParams } from "./types";
import { logger } from "../../utils/logger";
import { redisClient } from "../../config/redis";

export const EMAIL_QUEUE_NAME = process.env.EMAIL_QUEUE_NAME || "email-queue";

export const emailQueue = new Queue<SendTemplateEmailParams>(
  EMAIL_QUEUE_NAME,
  { connection: redisClient }
);

export async function enqueueEmail(payload: SendTemplateEmailParams) {
  await emailQueue.add("send-template-email", payload, {
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
