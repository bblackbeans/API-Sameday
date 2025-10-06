'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderSchema extends Schema {
  up() {
    this.create('orders', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').notNullable()
      table.integer('idDriver', 25).unsigned().references('id').inTable('users').nullable()
      table.integer('idDriverInvoice', 25).unsigned().references('id').inTable('driver_invoice').nullable()
      table.enu('status', ['pending', 'execution', 'canceled', 'finished']).notNullable()
      table.enu('deliveryStatus', ['pending', 'delivered', '1_attempt', '1_attemptFail', '2_attempt', '2_attemptFail', '3_attempt', '3_attemptFail', 'returnToStore']).notNullable()
      table.string('messageToDriver').nullable()
      table.string('duration').nullable()
      table.string('km').nullable()
      table.string('price').nullable()
      table.json('route').nullable()
      table.string('withdrawalCode').nullable()
      table.datetime('dateWithdrawal', { precision: 6 }).nullable()
      table.string('destinyCode').nullable()
      table.datetime('dateDelivery', { precision: 6 }).nullable()
      table.string('storeReturnCode').nullable()
      table.datetime('dateStoreReturnCode', { precision: 6 }).nullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('orders')
  }
}

module.exports = OrderSchema
