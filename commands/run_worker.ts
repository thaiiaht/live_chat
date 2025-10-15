// commands/run_worker.ts
import { BaseCommand,args } from '@adonisjs/core/ace'
import { runUserWorker } from '#workers/user_worker'
import { runMessageWorker } from '#workers/message_worker'

export default class RunWorker extends BaseCommand {
  static commandName = 'run:worker'
  static description = 'Run BullMQ workers'


  @args.string()
  declare queue: string

 async run() {
    const queue = this.queue
    console.log(`[ info ] 👷 Starting worker for queue: ${queue}`)

    switch (queue) {
      case 'user-queue':
        await runUserWorker()
        break
      case 'message-queue':
        await runMessageWorker()
        break
      default:
        console.error(`[ error ] ❌ Queue "${queue}" không tồn tại.`)
        process.exit(1)
    }

    console.log(`[ info ] ✅ Worker "${queue}" initialized. Listening for jobs...`)

    // Giữ tiến trình không bị exit
    await new Promise(() => {})
  }
}
