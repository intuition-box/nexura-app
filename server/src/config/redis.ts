import Redis from "ioredis";

import logger from "./logger";

import { environment, COOLIFY_REDIS, REDIS_URI, REDIS_PASSWORD, REDIS_PORT, REDIS_USERNAME } from "@/utils/env.utils";

let redis: Redis;

if (environment !== "development")
  redis = new Redis(COOLIFY_REDIS, { maxRetriesPerRequest: null });
else
  redis = new Redis({
    host: REDIS_URI,
    maxRetriesPerRequest: null,
    password: REDIS_PASSWORD,
    port: parseInt(REDIS_PORT, 10),
    username: REDIS_USERNAME,
  });

redis.on("connect", () => {
  logger.info("🔌 Redis connected");
});

redis.on("ready", () => {
  logger.info("✅ Redis ready");
});

redis.on("error", (error: any) => {
  logger.error(`❌ Redis error: ${error.message}`);
});

redis.on("end", () => {
  logger.warn("⚠️ Redis connection closed");
});

redis.on("reconnecting", (time: number) => {
  logger.warn(`♻️ Redis reconnecting in ${time}ms`);
});

export { redis };
