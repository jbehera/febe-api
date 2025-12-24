import IORedis from "ioredis";
import { logger } from "../utils/logger";

export const redisClient = new IORedis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error", err);
});
