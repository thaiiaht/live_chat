import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Users extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string | null

  @column()
  declare roomId: string | null

  @column()
  declare partner: string

  @column()
  declare role: 'user' | 'admin'

  @column()
  declare status: 'active' | 'block'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

}