'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddressSchema extends Schema {
  up() {
    this.create('addresses', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('address').notNullable()
      table.string('number').notNullable()
      table.string('complement').nullable()
      table.string('district').notNullable()
      table.string('zipCode').notNullable()
      table.string('state').notNullable()
      table.string('city').notNullable()
      table.string('latitude').nullable()
      table.string('longitude').nullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('addresses')
  }
}

module.exports = AddressSchema