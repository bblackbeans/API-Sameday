// Withdrawal and destination code verification

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class VerificationCodeCollectAndDestinationSchema extends Schema {
  up() {
    this.create('verification_code_collect_and_destination', (table) => {
      table.increments()
      table.integer('idOrder', 25).unsigned().references('id').inTable('orders').notNullable()
      table.integer('idDriver', 25).unsigned().references('id').inTable('users').notNullable()
      table.enu('type', ['collect', 'destination']).notNullable()
      table.datetime('sendSmsDate', { precision: 6 }).nullable()
      table.string('phone').notNullable()
      table.string('code').notNullable()
      table.string('driverConfirmationCode').nullable()
      table.string('attempts').nullable()
      table.enu('status', ['pending', 'code_invalid', 'approved']).notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('verification_code_collect_and_destination')
  }
}

module.exports = VerificationCodeCollectAndDestinationSchema