import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { handleDeploymentWebhook } from '../controllers/webhook-controller';

const router = Router();

const DeploymentWebhookBody = z.object({
  deploymentId: z.string(),
  status: z.enum(['success', 'failed', 'in_progress']),
  versionId: z.string().optional(),
  environment: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

router.post(
  '/deployment',
  validate({ body: DeploymentWebhookBody }),
  handleDeploymentWebhook
);

export { router as webhookRoutes };
