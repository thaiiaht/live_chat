import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.specificType('id', 'char(36)').primary().notNullable()
      table.string('room_id', 255).notNullable()
      table.string('user_id', 255).nullable()
      table.string('ip_address').nullable()
      table.boolean('is_guess').notNullable()
      table.text('message').notNullable()
      table.timestamp('created_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}