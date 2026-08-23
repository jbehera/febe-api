import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { emitDeploymentUpdate, emitPublishUpdate } from '../utils/socket';
import { versionService } from '../services/version-service';

export async function handleDeploymentWebhook(req: Request, res: Response) {
  const { status, versionId, graphQlUrl, restUrl, environment, message, timestamp } =
    req.body;

  logger.info(
    `[Webhook] Deployment version ${versionId} status: ${status}`,
    { status, versionId, environment }
  );

  try {
    // Map webhook status to deployment update
    const statusMap: Record<string, number> = {
      success: 3, // deployed
      failed: 4, // failed
      in_progress: 2, // deploying
    };

    const deploymentStatus = statusMap[status] ?? 0;

    const version = await versionService.getVersionById(versionId);

    // Update the version with status, graphQlUrl and restUrl
    if(version) {
      await versionService.update({ id: versionId, projectId: version.id, status, graphQlUrl, restUrl });
    }
    

    // Emit to frontend via Socket.io
    emitDeploymentUpdate(versionId, {
      status: deploymentStatus,
      statusLabel: status,
      message,
      versionId,
      environment,
    });

    logger.info(
      `[Webhook] Deployment versionId: ${versionId} status update emitted to ${deploymentStatus}`
    );

    return res.status(200).json({
      received: true,
      versionId,
      status,
      timestamp: timestamp || new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`[Webhook] Failed to process deployment webhook`, {
      versionId,
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
