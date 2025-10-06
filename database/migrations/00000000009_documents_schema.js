'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DocumentsSchema extends Schema {
  up() {
    this.create('documents', (table) => {
      table.increments()
      table.integer('idUser', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enu('category', ['driverPhoto', 'cnhPhoto', 'antecedentPhoto', 'photoOfProofOfAddress', 'vehiclePhoto', 'documentPhotoCRLV']).notNullable()
      table.string('name').notNullable()
      table.string('idCloudinary').notNullable()
      table.string('url').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('documents')
  }
}

module.exports = DocumentsSchema