
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import ChatsController from '#controllers/ChatsController'
import { middleware } from './kernel.js'
import AuthController from '#controllers/authController'

transmit.registerRoutes()

router.get('/home', async ({ view, auth }) => {
    await auth.use('web').check()
    const partner = auth.use('web').user
    return view.render('pages/home', { partner })
})

// Auth
router.group(() => {
    router.post('/login', [AuthController, 'login']).as('login')
    router.post('/register', [AuthController, 'register']).as('register')
    router.post('/logout', [AuthController, 'logout']).as('logout')
})
.as('auth')
.prefix('auth')



// API chat messages
router.get('/chats/embed', [ChatsController, 'show']).use(middleware.partner())
router.get('/chats/messages/:id', [ChatsController, 'index'])
router.post('/chats/messages/:id', [ChatsController, 'store'])
router.post('/donate/messages/:id', [ChatsController, 'donate'])
router.patch('/block', [ChatsController, 'block'])
