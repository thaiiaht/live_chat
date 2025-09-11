import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare roomName: string

  @column()
  declare venue: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime 

  @column.dateTime()
  declare endAt: DateTime 

  @beforeCreate()
  public static assignUuid( rooms: Room) {
    rooms.id = uuidv4()
  }
}