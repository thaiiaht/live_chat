import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export default class AuthPartner {
    async handle(ctx: HttpContext, next: () => Promise<void>) {
        const token = ctx.request.input('token')

        if (!token) {
            return ctx.response.unauthorized({ error: 'Missing token' })
        }

        try {
            const JWT_SECRET = 'thaideptraibodoiqua'
            const payload = jwt.verify(token, JWT_SECRET!)
            ctx.request.updateBody({ user: payload })
            await next()
        } catch (err) {
            return ctx.response.unauthorized({ error: 'Invalid token' })
        }
    }
}