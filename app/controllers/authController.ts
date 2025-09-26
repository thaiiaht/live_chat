import { HttpContext } from '@adonisjs/core/http'
import Partner from '#models/partner'


export default class AuthController {
    async login({ request, response, auth }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])
        try {
        const partner = await Partner.verifyCredentials(email, password)
        await auth.use('web').login(partner)

        return response.ok({
            success: true,
        })
        } catch {
            return response.badRequest({
                success: false,
            })
        }
    }

    async register({ request, response }: HttpContext) {
        const { fullName, email, password } = request.only(['fullName' ,'email', 'password'])
        try {
        await Partner.create({
            partnerName: fullName,
            email: email,
            password: password,
        })
        return response.ok({
            success: true,
        })
        } catch {
            return response.badRequest({
                success: false,
            })
        }
    }

    async logout({ auth, response }: HttpContext) {
        await auth.use('web').logout()
        return response.ok({
            success: true,
        })
    }

}