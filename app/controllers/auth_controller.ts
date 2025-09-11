import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
    async login({ request, auth }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])
            const user = await User.verifyCredentials(email, password)
            return await auth.use('api').createToken(user)
    }

    async me({ auth }: HttpContext) {
        await auth.authenticate()
        return auth.user
    }

    async logout({ auth }: HttpContext) {
        await auth.use('api').invalidateToken()
    }

    async register({ request, response}: HttpContext) {
        const req = await request.only(['fullName', 'email', 'password'])
        await User.create({
            ...req,
        })
        response.created(req)
    }
}