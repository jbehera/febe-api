import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { handleDeploymentWebhook, handlePublishWebhook } from '../controllers/webhook-controller';

const router = Router();

const DeploymentWebhookBody = z.object({
  deploymentId: z.string(),
  status: z.enum(['success', 'failed', 'in_progress']),
  versionId: z.string().optional(),
  environment: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

const PublishWebhookBody = z.object({
  versionId: z.string(),
  status: z.enum(['success', 'failed', 'in_progress']),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

router.post(
  '/deployment',
  validate({ body: DeploymentWebhookBody }),
  handleDeploymentWebhook
);

router.post(
  '/publish',
  validate({ body: PublishWebhookBody }),
  handlePublishWebhook
);

export { router as webhookRoutes };
