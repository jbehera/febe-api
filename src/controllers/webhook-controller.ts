import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { emitDeploymentUpdate, emitPublishUpdate } from '../utils/socket';

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

    // Emit to frontend via Socket.io
    emitDeploymentUpdate(deploymentId, {
      status: deploymentStatus,
      statusLabel: status,
      message,
      versionId,
      environment,
    });

    logger.info(
      `[Webhook] Deployment ${deploymentId} status update emitted to ${deploymentStatus}`
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

export async function handlePublishWebhook(req: Request, res: Response) {
  logger.info(`[Webhook] Received publish webhook`, { body: req.body });

  try {
    const { versionId, status, message } = req.body;
    
    if (versionId) {
      // Map webhook status to publish status
      const statusMap: Record<string, number> = {
        success: 3, // published
        failed: 4, // failed
        in_progress: 2, // publishing
      };

      const publishStatus = statusMap[status] ?? 0;

      // Emit to frontend via Socket.io
      emitPublishUpdate(versionId, {
        status: publishStatus,
        statusLabel: status,
        message,
      });

      logger.info(`[Webhook] Version ${versionId} publish update emitted`);
    }

    return res.status(200).json({
      received: true,
      message: 'Publish webhook received',
    });
  } catch (error: any) {
    logger.error(`[Webhook] Failed to process publish webhook`, {
      error: error.message,
    });

    return res.status(500).json({
      received: false,
      error: 'Failed to process publish webhook',
    });
  }
}
