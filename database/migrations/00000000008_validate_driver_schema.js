'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ValidateDriverSchema extends Schema {
  up() {
    this.create('validateDriver', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enu('category', ['driverPhoto', 'cnhPhoto', 'antecedentPhoto', 'photoOfProofOfAddress', 'vehiclePhoto', 'documentPhotoCRLV']).notNullable()
      table.enu('status', ['pending', 'revision', 'approved', 'reproved']).notNullable()
      table.string('reason').nullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('validateDriver')
  }
}

module.exports = ValidateDriverSchema