import IORedis from "ioredis";
import { logger } from "../utils/logger";

const isDev = process.env.NODE_ENV !== 'production';

export const redisClient: IORedis | null = isDev
  ? null
  : new IORedis({
      host: process.env.REDIS_HOST!,
      port: Number(process.env.REDIS_PORT!),
      maxRetriesPerRequest: null,
    });

if (redisClient) {
  redisClient.on("connect", () => {
    logger.info("Redis connected");
  });

  redisClient.on("error", (err) => {
    logger.error("Redis connection error", err);
  });
}
