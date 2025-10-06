'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DriverInvoiceSchema extends Schema {
  up() {
    this.create('driver_invoice', (table) => {
      table.increments()
      table.string('reference').nullable()
      table.enu('orderStatus', ['waiting', 'payed', 'payable', 'late']).notNullable()
      table.enu('paymentStatus', ['waiting', 'payed', 'payable', 'late']).notNullable()
      table.integer('idDriver', 25).unsigned().references('id').inTable('users').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('driver_invoice')
  }
}

module.exports = DriverInvoiceSchema