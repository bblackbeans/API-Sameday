'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ContactsSchema extends Schema {
  up() {
    this.create('contacts', (table) => {
      table.increments()
      table.string('name', 100).notNullable()
      table.string('email', 120).notNullable()
      table.string('phone', 20)
      table.string('subject', 200).notNullable()
      table.text('message').notNullable()
      table.string('user_type', 50)
      table.string('status', 20).defaultTo('new')
      table.timestamps()
    })
  }

  down() {
    this.drop('contacts')
  }
}

module.exports = ContactsSchema
