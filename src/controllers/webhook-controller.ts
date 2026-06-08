import { Request, Response } from 'express';
import { deploymentService } from '../services/deployment-service';
import { logger } from '../utils/logger';

export async function handleDeploymentWebhook(req: Request, res: Response) {
  const { deploymentId, status, versionId, environment, message, timestamp } =
    req.body;

  logger.info(
    `[Webhook] Deployment ${deploymentId} status: ${status}`,
    { deploymentId, status, versionId, environment }
  );

  try {
    // Map webhook status to deployment update
    const statusMap: Record<string, number> = {
      success: 3, // deployed
      failed: 4, // failed
      in_progress: 2, // deploying
    };

    const deploymentStatus = statusMap[status] ?? 0;

    // Update the deployment record with the new status
    await deploymentService.update({
      id: deploymentId,
      status: deploymentStatus,
      ...(message ? { description: message } : {}),
    } as any);

    logger.info(
      `[Webhook] Deployment ${deploymentId} updated to status ${deploymentStatus}`
    );

    return res.status(200).json({
      received: true,
      deploymentId,
      status,
      timestamp: timestamp || new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`[Webhook] Failed to process deployment webhook`, {
      deploymentId,
      error: error.message,
    });

    return res.status(500).json({
      received: false,
      error: 'Failed to process webhook',
    });
  }
}
