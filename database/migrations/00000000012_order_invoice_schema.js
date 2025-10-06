'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderInvoiceSchema extends Schema {
  up() {
    this.create('order_invoice', (table) => {
      table.increments()
      table.string('method').nullable()
      table.string('value').nullable()
      table.string('pixQRCode').nullable()
      table.string('pixQRCodeText').nullable()
      table.string('creditCardStatus').nullable()
      table.string('creditCardMessage').nullable()
      table.string('providerPaymentId').nullable()
      table.string('providerCustomerId').nullable()
      table.enu('status', ['pending', 'approve', 'reprove', 'refunded']).notNullable()
      table.integer('idOrder', 25).unsigned().references('id').inTable('orders').notNullable()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('order_invoice')
  }
}

module.exports = OrderInvoiceSchema