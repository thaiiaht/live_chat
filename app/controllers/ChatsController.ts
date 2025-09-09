import { HttpContext } from '@adonisjs/core/http'
import ChatMessage from '#models/chat_message'
import transmit from '@adonisjs/transmit/services/main'

export default class ChatsController {
  async show({ view, params }: HttpContext) {
    return view.render('pages/liveStream', { roomId:params.id } )
  }

  // Lấy 50 tin mới nhất
  public async index({ params, response }: HttpContext) {
    try {
    const messages = await ChatMessage.query()
      .where('roomId', params.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
    return messages.reverse() // trả mảng trực tiếp
    } catch (error) {
        return response.badRequest('deo thay')
    }
  }

  // Tạo tin nhắn mới
  public async store({ params, request, response }: HttpContext) {
    const body = request.input('body')
    let sender = request.input('sender')

    if (!sender) {
        response.badRequest('không có sender')
    //   sender = 'Guest_' + Math.floor(Math.random() * 10000)
    }

    if (!body || body.trim() === '') {
      return response.badRequest({ message: 'body is required' })
    }

    const msg = await ChatMessage.create({ 
        roomId: params.id,
        sender: sender,
        body: body,
    })

    // broadcast realtime
    transmit.broadcast(`chats/${params.id}/messages`, {
      id: msg.id,
      roomId: msg.roomId,
      sender: msg.sender,
      body: msg.body,
      createdAt: msg.createdAt.toISO(),
    })

    return response.json(msg)
  }
}
