'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderInformationSchema extends Schema {
  up() {
    this.create('order_information', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('idOrder', 25).unsigned().references('id').inTable('orders').nullable()
      table.json('withdraw').notNullable()
      table.json('destiny').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('order_information')
  }
}

module.exports = OrderInformationSchema