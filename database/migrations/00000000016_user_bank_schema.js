'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserBankSchema extends Schema {
  up() {
    this.create('user_bank', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').notNullable()
      table.string('bank').nullable()
      table.string('agency').nullable()
      table.string('account').nullable()
      table.string('accountDigit').nullable()      
      table.timestamps()
    })
  }

  down() {
    this.drop('user_bank')
  }
}

module.exports = UserBankSchema