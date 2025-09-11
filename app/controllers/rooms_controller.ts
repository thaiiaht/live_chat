import { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'

export default class RoomController {
    async index({ view }: HttpContext) {
        const rooms = await Room.all()
        return view.render('pages/home', { rooms })
    }

    async store({ request, response }: HttpContext) {
        const req = await request.only(['roomName', 'venue', "endAt"])
        await Room.create({ ...req })
        return response.created( req )
    }
}