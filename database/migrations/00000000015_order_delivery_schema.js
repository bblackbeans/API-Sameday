'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderDeliverySchema extends Schema {
  up() {
    this.create('order_delivery', (table) => {
      table.increments()
      table.integer('idOrder', 25).unsigned().references('id').inTable('orders').notNullable()
      table.integer('idDriver', 25).unsigned().references('id').inTable('users').notNullable()
      table.enu('deliveryStatus', ['pending', 'delivered', 'confirmDelivery', 'rejectDelivery', 'attemptDelivery', 'deliveryFail', 'returnToDestination']).notNullable()
      table.enu('deliveryFailStatus', ['mudou_se', 'desconhecido', 'ausente', 'end_insuficiente', 'recusado', 'falecido', 'nao_existe_numero_indicado', 'nao_procurado', 'outros']).nullable()
      table.timestamp('eventDate').nullable()
      table.boolean('success').defaultTo(false)
      table.timestamps()
    })
  }

  down() {
    this.drop('order_delivery')
  }
}

module.exports = OrderDeliverySchema