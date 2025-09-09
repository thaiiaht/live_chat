import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import ChatMessage from '#models/chat_message'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare roomName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null

  @beforeCreate()
  public static assignUuid( room : Room) {
    room.id = uuidv4()
  }

  @hasMany(() => ChatMessage )
  declare chat: HasMany<typeof ChatMessage>

}