import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Room from '#models/room'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ChatMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare roomId: string

  @column()
  declare userId: string | null

  @column()
  declare type: 'user' | 'system'

  @column()
  declare message: string 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @beforeCreate()
  public static assignUuid( chat: ChatMessage ) {
    chat.id = uuidv4()
  }

  @belongsTo(()=> Room)
  declare room: BelongsTo<typeof Room>


}