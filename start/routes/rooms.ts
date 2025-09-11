import router from '@adonisjs/core/services/router'
import RoomController from '#controllers/rooms_controller'

router.group(()=> {
    router.get('/', [RoomController, 'index']).as('index')
    router.post('/store', [RoomController, 'store']).as('store')
})
.as('rooms')
.prefix('rooms')