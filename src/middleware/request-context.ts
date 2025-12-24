// middleware/contextMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { requestContextStore } from '../context/request-context';
import crypto from 'node:crypto';

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];

  // Extract token logic (simple split for example)
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

  // Generate or extract traceId
  const traceId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('x-request-id', traceId);

  // Initialize the store for this specific request
  const store = {
    token,
    traceId,
  };

  // 'run' executes the callback (next) within the context of 'store'
  requestContextStore.run(store, () => {
    next();
  });
};
