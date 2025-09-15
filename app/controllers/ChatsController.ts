import { HttpContext } from '@adonisjs/core/http'
import ChatMessage from '#models/chat_message'
import transmit from '@adonisjs/transmit/services/main'
import Room from '#models/room'
import Donate from '#models/donate'

export default class ChatsController {
  async show({ view, params }: HttpContext) {
    const room = await Room.findByOrFail('id', params.id)
    return view.render('pages/liveStream', { room } )
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
       sender = 'Guest_' + Math.floor(Math.random() * 10000)
    }

    if (!body || body.trim() === '') {
      return response.badRequest({ message: 'body is required' })
    }

    const msg = await ChatMessage.create({ 
        roomId: params.id,
        sender: sender,
        body: body,
        type: 'user',
    })

    // broadcast realtime
    transmit.broadcast(`/chats/messages/${params.id}`, {
      id: msg.id,
      roomId: msg.roomId,
      sender: msg.sender,
      body: msg.body,
      createdAt: msg.createdAt.toISO(),
      type: 'user',
    })

    return response.json(msg)
  }

  // Donate
  async donate({ request, params}: HttpContext) {
    const req = await request.only(['sender', 'gift', 'total'])
    await Donate.create({
      userName: req.sender,
      totalMoney: req.total,
      donatedItem: req.gift,
      roomId: params.id,
    })
    
    const msg = await ChatMessage.create({ 
        roomId: params.id,
        sender: req.sender,
        body: ` ${req.sender} đã donate ${req.total}K VNĐ! `,
        type: 'system',
    })

    transmit.broadcast(`/chats/messages/${params.id}`, {
      id: msg.id,
      roomId: msg.roomId,
      sender: msg.sender,
      body: msg.body,
      createdAt: msg.createdAt.toISO(),
      type: 'system',
    })

  }
}
