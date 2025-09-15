import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'donates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.specificType('id', 'char(36)').primary().notNullable()
      table.string('userName', 255).notNullable()
      table.string('totalMoney', 255).notNullable()
      table.string('donatedItems', 255).notNullable()
      table.timestamp('created_at', {useTz: true})
      table.timestamp('updated_at', {useTz: true})
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}