import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

router.group(() => {
    router.post('/login', [AuthController, 'login']).as('login')
    router.post('/register', [AuthController, 'register']).as('register')
    router.get('/me', [AuthController, 'me']).as('me').use(middleware.auth())
    router.post('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
})
.as('auth')
.prefix('auth')
