'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LewsletterSchema extends Schema {
  up() {
    this.create('lewsletters', (table) => {
      table.increments()
      table.string('email')
      table.string('name')
      table.string('phone')
      table.string('business')
      table.string('message')
      table.timestamps()
    })
  }

  down() {
    this.drop('lewsletters')
  }
}

module.exports = LewsletterSchema