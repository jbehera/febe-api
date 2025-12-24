// context/requestContext.ts
import { AsyncLocalStorage } from 'node:async_hooks';

// Define the shape of the data we want to share across the request lifecycle
export interface RequestContext {
  token?: string;
  traceId?: string; // Optional: good for tracking logs
}

// Create the storage instance
export const requestContextStore = new AsyncLocalStorage<RequestContext>();

/**
 * Helper to get the current context safely.
 */
export const getRequestContext = (): RequestContext | undefined => {
  return requestContextStore.getStore();
};
