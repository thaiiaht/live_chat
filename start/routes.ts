
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import ChatsController from '#controllers/ChatsController'
import AuthController from '#controllers/authController'
import UserController from '#controllers/UserController'

transmit.registerRoutes()

router.get('/home', async ({ view, auth }) => {
    await auth.use('web').check()
    const partner = auth.use('web').user
    return view.render('pages/home', { partner })
})

router.get('/test', async ({ view  }) => {
    return view.render('pages/test')
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
router.get('/chats/embed', [ChatsController, 'show'])
router.post('/join', [ChatsController, 'join'])
router.get('/chats/messages/:id', [ChatsController, 'index'])
router.post('/chats/messages/:id', [ChatsController, 'store'])
router.post('/donate/messages/:id', [ChatsController, 'donate'])
router.patch('/block', [ChatsController, 'block'])
router.patch('/unblock', [ChatsController, 'unblock'])


// User Management
router.group(() => {
    router.get('/', [UserController, 'UserPage']).as('userPage')
    router.get('/block', [UserController, 'BlockPage']).as('blockPage')
})
.as('user')
.prefix('user')
