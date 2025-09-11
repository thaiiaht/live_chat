import { defineConfig } from '@adonisjs/transmit'
import env from '#start/env'
import { redis } from '@adonisjs/transmit/transports'


export default defineConfig({
  pingInterval: '30s',
   transport: {
    driver: redis({
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD'),
      keyPrefix: 'transmit',
    })
  }
})  