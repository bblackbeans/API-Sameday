'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChatSchema extends Schema {
  up() {
    this.create('chats', (table) => {
      table.increments()
      table.string('message')
      table.string('idBusiness')
      table.string('idDeliveryman')
      table.string('type')
      table.timestamps()
    })
  }

  down() {
    this.drop('chats')
  }
}

module.exports = ChatSchema