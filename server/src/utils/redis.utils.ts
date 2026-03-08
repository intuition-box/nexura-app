import { redis } from "@/config/redis";

export const REDIS = {
  set: async ({ key, data, ttl }: { key: string; data: Record<string, any> | string[], ttl?: number }) => {
    if (ttl) {
      await redis.set(key, JSON.stringify(data), "EX", ttl);
    } else {
      await redis.set(key, JSON.stringify(data));
    }
  },

  get: async (key: string): Promise<Record<string, any> | string[]> => {
    const redisData = await redis.get(key);

    return redisData ? JSON.parse(redisData) : null;
  }
}
