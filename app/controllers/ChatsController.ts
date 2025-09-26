import { HttpContext } from '@adonisjs/core/http'
import ChatMessage from '#models/chat_message'
import transmit from '@adonisjs/transmit/services/main'
import Donate from '#models/donate'
import Users from '#models/user'

export default class ChatsController {
  async show({ view, request, auth }: HttpContext) {
    await auth.use('web').check()
    const partner = auth.use('web').user

    const user = request.body().user
    const roomId = request.qs().roomId
    const data = await Users.findBy('id', user.id)
    if (!data) {
      const data = await Users.create({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roomId: roomId,
        partnerId: partner?.id,
      })
      return view.render('pages/chatBox', { data, roomId } ) 
    }
    return view.render('pages/chatBox', { data, roomId } )
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
    const senderId = request.input('senderId')
    if (!body || body.trim() === '') {
      return response.badRequest({ message: 'body is required' })
    }

    const msg = await ChatMessage.create({ 
        roomId: params.id,
        sender: sender,
        senderId: senderId,
        body: body,
        type: 'user',
    })

    // broadcast realtime
    transmit.broadcast(`/chats/messages/${params.id}`, {
      id: msg.id,
      roomId: msg.roomId,
      sender: msg.sender,
      senderId: msg.senderId,
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

  // Block
  async block({ request, response }: HttpContext) {
    try {
      const {senderId} = await request.only(['senderId'])
      const data = await Users.findByOrFail('id', senderId)
      data.status = 'block',
      await data.save()

      await ChatMessage.query()
        .where('senderId', senderId)
        .delete()

      transmit.broadcast('messages: deleted', { senderId })

      transmit.broadcast(`/user/${senderId}`, {
        type: 'blocked',
        message: 'Bạn đã bị block bởi mod',
      })

      return response.json({ success: true })
    } catch {
      return response.badRequest(' Try Again ')
    }
  }

  async unblock({ request, response}: HttpContext) {
    try {
      const {senderId} = await request.only(['senderId'])
      const data = await Users.findByOrFail('id', senderId)
      data.status = 'active',
      await data.save()

      return response.json({ success: true })
      } catch {
      return response.badRequest(' Try Again ')
    }
  }
}
