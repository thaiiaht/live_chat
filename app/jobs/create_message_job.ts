import { Queue } from 'bullmq'
import RedisPkg from 'ioredis'
const Redis = RedisPkg.default || RedisPkg
import { redisConfig } from '#config/redis'

// ⚙️ Kết nối Redis
const connection = new Redis(redisConfig)

// ⚙️ Tạo hàng đợi message
export const messageQueue = new Queue('message-queue', { connection })

// ⚙️ Hàm enqueue
export const enqueueMessageCreation = async (payload: {
  roomId: string
  sender: string
  senderId: string
  body: string
  type: string
}) => {
  await messageQueue.add('createMessage', payload)
  console.log('📦 Message job added to queue:', payload)
}
