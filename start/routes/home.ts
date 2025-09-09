import router from '@adonisjs/core/services/router'
import HomeController from '#controllers/home_controller'

router.get('/', [HomeController, 'index'])
router.post('/create', [HomeController, 'create'])