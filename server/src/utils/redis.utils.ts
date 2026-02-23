import { redis } from "@/config/redis";

export const REDIS = {
  set: async({ key, data }: { key: string; data: Record<string, any> | string[] }) => {
    await redis.set(key, JSON.stringify(data));
  },

  get: async (key: string): Promise<Record<string, any> | string[]> => {
    const redisData = await redis.get(key);

    return redisData ? JSON.parse(redisData) : []
  }
}
