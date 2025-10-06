'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StockStorePartnersSchema extends Schema {
  up() {
    this.create('stock_store_partners', (table) => {
      table.increments()
      table.string('owner_name', 100).notNullable()
      table.string('email', 120).notNullable()
      table.string('phone', 20).notNullable()
      table.string('cpf_cnpj', 18).notNullable()
      table.string('property_type', 50).notNullable()
      table.text('address').notNullable()
      table.string('space_size', 20)
      table.string('availability', 50)
      table.string('experience', 200)
      table.text('description')
      table.string('status', 20).defaultTo('pending')
      table.timestamps()
    })
  }

  down() {
    this.drop('stock_store_partners')
  }
}

module.exports = StockStorePartnersSchema
