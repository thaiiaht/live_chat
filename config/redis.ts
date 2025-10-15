// config/redis.ts
import { RedisOptions } from 'ioredis'

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // ⚠️ Bắt buộc cho BullMQ
}
