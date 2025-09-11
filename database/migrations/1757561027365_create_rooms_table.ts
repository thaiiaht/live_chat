import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.specificType('id', 'char(36)').primary().notNullable()
      table.string('room_name', 255).notNullable()
      table.string('venue', 255).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('end_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}