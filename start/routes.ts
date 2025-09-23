
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import ChatsController from '#controllers/chatsController'
import { middleware } from './kernel.js'

transmit.registerRoutes()

// API chat messages
router.get('/chats/embed', [ChatsController, 'show']).use(middleware.partner())
router.get('/chats/messages/:id', [ChatsController, 'index'])
router.post('/chats/messages/:id', [ChatsController, 'store'])
router.post('/donate/messages/:id', [ChatsController, 'donate'])
