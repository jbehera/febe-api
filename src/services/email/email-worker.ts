import { Worker, Job } from "bullmq";
import { redisClient } from "../../config/redis";
import { ZohoEmailService } from "./zoho-email";
import { SendTemplateEmailParams } from "./types";
import { EMAIL_QUEUE_NAME } from "./email-queue";
import { logger } from "../../utils/logger";

const emailService = new ZohoEmailService();

export const emailWorker = new Worker<SendTemplateEmailParams>(
  EMAIL_QUEUE_NAME,
  async (job: Job<SendTemplateEmailParams>) => {
    logger.info("Processing email job", {
      jobId: job.id,
      templateId: job.data.templateId,
    });

    await emailService.sendTemplateEmail(job.data);
  },
  { connection: redisClient }
);

emailWorker.on("completed", (job) => {
  logger.info("Email job completed", { jobId: job.id });
});

emailWorker.on("failed", (job, err) => {
  logger.error("Email job failed", {
    jobId: job?.id,
    error: err.message,
  });
});
