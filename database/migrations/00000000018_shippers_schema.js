'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ShippersSchema extends Schema {
  up() {
    this.create('shippers', (table) => {
      table.increments()
      table.string('company_name', 200).notNullable()
      table.string('cnpj', 18).notNullable().unique()
      table.string('contact_name', 100).notNullable()
      table.string('email', 120).notNullable()
      table.string('phone', 20).notNullable()
      table.text('address').notNullable()
      table.string('business_type', 100)
      table.string('monthly_volume', 50)
      table.text('description')
      table.string('status', 20).defaultTo('pending')
      table.timestamps()
    })
  }

  down() {
    this.drop('shippers')
  }
}

module.exports = ShippersSchema
