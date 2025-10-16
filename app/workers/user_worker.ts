import { Worker } from 'bullmq'
import RedisPkg from 'ioredis'
import { redisConfig } from '#config/redis'
import Users from '#models/user'
import app from '@adonisjs/core/services/app'

export async function runUserWorker() {
  await app.boot()

// 👇 Giờ mới import model sau khi boot app


const Redis = RedisPkg.default || RedisPkg
const connection = new Redis({
  ...redisConfig,
  maxRetriesPerRequest: null,
})
  console.log('🚀 Worker started')

  const worker = new Worker(
    'user-queue',
    async (job) => {
      const { id, email, fullName, roomId, partner, role } = job.data

      const exists = await Users.query().where('id', id).first()
      if (!exists) {
        await Users.create({
          id,
          email,
          fullName,
          roomId,
          partner,
          role,
        })
      }

      console.log('✅ User created or exists:', email)
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
