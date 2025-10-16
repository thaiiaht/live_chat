import { Queue } from 'bullmq'
import RedisPkg from 'ioredis'
const Redis = RedisPkg.default || RedisPkg
import { redisConfig } from '#config/redis'

const connection = new Redis(redisConfig)
export const userQueue = new Queue('user-queue', { connection })

export const enqueueUserCreation = async (payload: {
  id: string
  email: string
  fullName: string
  roomId: string
  partner: string
  role: string
}) => {
  await userQueue.add('createUser', payload)
  console.log('📦 Job added to queue:', payload)
}