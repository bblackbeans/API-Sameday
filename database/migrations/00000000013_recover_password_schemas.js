'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecoverPassword extends Schema {
  up() {
    this.create('recover_password', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('phone').notNullable()
      table.string('code').notNullable()
      table.enu('status', ['code_pending', 'code_expired', 'code_invalid', 'code_confirmed', 'approved_change']).notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('recover_password')
  }
}

module.exports = RecoverPassword
