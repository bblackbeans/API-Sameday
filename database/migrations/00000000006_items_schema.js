'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ItemsSchema extends Schema {
  up() {
    this.create('items', (table) => {
      table.increments()
      table.integer('idOrder', 25).unsigned().references('id').inTable('orders').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('model').nullable()
      table.string('width').notNullable()
      table.string('conversion_width').notNullable()
      table.string('height').notNullable()
      table.string('conversion_height').notNullable()
      table.string('length').notNullable()
      table.string('conversion_length').notNullable()
      table.string('weight').notNullable()
      table.string('conversion_weight').notNullable()
      table.string('quantity').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('items')
  }
}

module.exports = ItemsSchema