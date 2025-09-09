import { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import ChatMessage from '#models/chat_message'
import transmit from '@adonisjs/transmit/services/main'

export default class ChatController {
    async index({ view, params }: HttpContext) {
        const room = await Room.findBy('id', params.id)
        const message = await ChatMessage.query().where('roomId', params.id).orderBy('createdAt', 'desc').limit(50)   
        return view.render('pages/liveStream', { room, message })
  }
    async store({ params, request, response }: HttpContext) {
        const user = request.input('userName')
        const message = request.input('message')
        // Lưu DB
        const msg = await ChatMessage.create({
           userId: user,
           roomId: params.id,
           message: message, 
           type: 'user',
        })
        // Broadcast
        transmit.broadcast(`chat/${params.id}/messages`, {
            id: msg.id,
            roomId: msg.roomId,
            user: msg.userId,
            message: msg.message,
            createdAt: msg.createdAt.toISO(),
        })
        return response.created({ msg })
    }
}