import { HttpContext } from '@adonisjs/core/http'
import ChatMessage from '#models/chat_message'
import transmit from '@adonisjs/transmit/services/main'
import Users from '#models/user'
import jwt from 'jsonwebtoken'
import Donate from '#models/donate'
import { Filter } from 'bad-words'
const filter = new Filter();
filter.addWords('dm', 'đm', 'cc', 'cl', 'vl', 'địt', 'cặc', 'lồn', 'bitch', 'fuck')

export default class ChatsController {
  async show({ view }: HttpContext) {
    return view.render('pages/chatBox')
  }

  async join({ request, response, auth }: HttpContext) {
      await auth.use('web').check()
      const partner = auth.use('web').user
      const { roomId, token } = request.only(['roomId', 'token'])
       try {
        const user = jwt.verify(token, process.env.JWT_SECRET!) as {
          id: string
          email: string
          fullName: string
        }
        console.log(roomId)
        const data = await Users.query().where('id', user.id).first()
          if (!data) {
            await Users.create({
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              roomId: roomId,
              partnerId: partner?.id,
            })
          }
          transmit.broadcast(`join/${token}`, {
            event: 'user_joined',
            data: {
              id: user.id,
              sender: user.fullName,
              email: user.email,
              role: data!.role,
            },
          })

          return response.json({
            status: 'ok',
            user,
          })
        } catch (error) {
          return response.badRequest({ status: 'error', message: 'Invalid token' })
        }
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
    const cleanBody = filter.clean(body)
    const msg = await ChatMessage.create({ 
        roomId: params.id,
        sender: sender,
        senderId: senderId,
        body: cleanBody,
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
    const req = await request.only(['sender', 'gift', 'total', 'senderId'])
    await Donate.create({
      userName: req.sender,
      totalMoney: req.total,
      donatedItem: req.gift,
      roomId: params.id,
    })
    
    const msg = await ChatMessage.create({ 
        roomId: params.id,
        sender: req.sender,
        senderId: req.senderId,
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
