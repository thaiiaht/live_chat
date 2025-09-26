import { HttpContext } from '@adonisjs/core/http'
import Users from '#models/user'

export default class UserController {
    async UserPage({ view, auth }: HttpContext) {
        await auth.use('web').check()
        const partner = auth.use('web').user
        const data = await Users.query().where('partnerId', partner!.id).where('status', 'active')
        return view.render('pages/userPages', { data, partner })
    }

    async BlockPage({ view, auth }: HttpContext) {
        await auth.use('web').check()
        const partner = auth.use('web').user
        const data = await Users.query().where('partnerId', partner!.id).where('status', 'block')
        return view.render('pages/blockPages', { data, partner })
    }
}