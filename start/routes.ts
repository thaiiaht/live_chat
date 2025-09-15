import '#start/routes/auth'
import '#start/routes/rooms'

import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import ChatsController from '#controllers/ChatsController'

transmit.registerRoutes()


// API chat messages
router.get('/chats/:id', [ChatsController, 'show'])
router.get('/chats/messages/:id', [ChatsController, 'index'])
router.post('/chats/messages/:id', [ChatsController, 'store'])
router.post('/donate/messages/:id', [ChatsController, 'donate'])
