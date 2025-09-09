import transmit from '@adonisjs/transmit/services/main'

transmit.authorize('chats/:id/messages', async () => {
  return true
})
