import { Worker } from 'bullmq'
import RedisPkg from 'ioredis'
import { redisConfig } from '#config/redis'
import ChatMessage from '#models/chat_message'
import app from '@adonisjs/core/services/app'

export async function runMessageWorker() {
  await app.boot()

// 👇 Giờ mới import model sau khi boot app


const Redis = RedisPkg.default || RedisPkg
const connection = new Redis({
  ...redisConfig,
  maxRetriesPerRequest: null,
})
  console.log('🚀 Worker started')

  const worker = new Worker(
    'message-queue',
    async (job) => {
      const { roomId, sender, senderId, body, type } = job.data

        await ChatMessage.create({
          roomId,
          sender,
          senderId,
          body,
          type,
        })

      console.log('✅ Message stored :', body)
    },
    { connection }
  )

  worker.on('completed', (job) => {
    console.log(`🎉 Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ Job failed [${job?.id ?? 'unknown'}]:`, err)
  })
}
