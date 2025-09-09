import { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'

export default class HomeController {
    async index({ view }: HttpContext) {
        const room = await Room.all()
        return view.render('pages/home', { room })
    }

    async create({ request, response }: HttpContext) {
        const req = await request.only(['roomName'])
        const data = await Room.create({
            roomName: req.roomName
        })
        response.created({ data })
    }
}