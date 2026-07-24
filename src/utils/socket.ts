import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from './logger';

let io: SocketIOServer | null = null;

export function initializeSocket(server: any): SocketIOServer {
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:4000',
    'http://localhost:3000',
  ];

  if (process.env.FEBE_UI_APP_URL) {
    allowedOrigins.push(process.env.FEBE_UI_APP_URL);
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`[Socket] Client disconnected: ${socket.id}`);
    });

    // Optional: handle custom events if needed
    socket.on('error', (error) => {
      logger.error(`[Socket] Error from ${socket.id}:`, error);
    });
  });

  return io;
}

export function getSocket(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitDeploymentUpdate(deploymentId: string, data: any) {
  try {
    if (!io) return;
    io.emit(`deployment:${deploymentId}`, {
      deploymentId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    logger.info(`[Socket] Emitted deployment update for ${deploymentId}`);
  } catch (error) {
    logger.error(`[Socket] Failed to emit deployment update`, error);
  }
}

export function emitPublishUpdate(versionId: string, data: any) {
  try {
    if (!io) return;
    io.emit(`publish:${versionId}`, {
      versionId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    logger.info(`[Socket] Emitted publish update for ${versionId}`);
  } catch (error) {
    logger.error(`[Socket] Failed to emit publish update`, error);
  }
}
