'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DeliveryVehicleSchema extends Schema {
  up() {
    this.create('delivery_vehicles', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('brand').notNullable()
      table.string('model').notNullable()
      table.string('year').notNullable()
      table.string('color').notNullable()
      table.string('plate').notNullable()
      table.string('renavam').notNullable()
      table.string('category').notNullable()
      table.string('width').notNullable()
      table.string('conversion_width').notNullable()
      table.string('height').notNullable()
      table.string('conversion_height').notNullable()
      table.string('length').notNullable()
      table.string('conversion_length').notNullable()
      table.string('weight').notNullable()
      table.string('conversion_weight').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('delivery_vehicles')
  }
}

module.exports = DeliveryVehicleSchema
