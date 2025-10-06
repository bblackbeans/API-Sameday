'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarriersSchema extends Schema {
  up() {
    this.create('carriers', (table) => {
      table.increments()
      table.string('company_name', 200).notNullable()
      table.string('cnpj', 18).notNullable().unique()
      table.string('contact_name', 100).notNullable()
      table.string('email', 120).notNullable()
      table.string('phone', 20).notNullable()
      table.text('address').notNullable()
      table.string('rntrc', 50).notNullable()
      table.string('fleet_size', 20)
      table.string('vehicle_types', 200)
      table.string('operation_areas', 200)
      table.string('experience', 20)
      table.text('description')
      table.string('status', 20).defaultTo('pending')
      table.timestamps()
    })
  }

  down() {
    this.drop('carriers')
  }
}

module.exports = CarriersSchema
