import router from '@adonisjs/core/services/router'
import ChatController from '#controllers/chat_controller'
import transmit from '@adonisjs/transmit/services/main'

transmit.registerRoutes()

router
.group(() => {
    router.get('/:id/messages', [ChatController, 'index']).as('index')
    router.post('/:id/messages', [ChatController, 'store']).as('store')
})
.as('chat')
.prefix('chat')