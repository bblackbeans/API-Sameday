'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

// Users
class UsersSchema extends Schema {
  up() {
    this.create('users', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.string('fantasyName').nullable()
      table.string('phone').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.enu('status', ['active', 'inac']).notNullable()
      table.enu('profile', ['administrator', 'client', 'driver']).notNullable()
      table.enu('typeUser', ['client', 'business', 'driver']).notNullable()
      table.enu('documentsValidated', ['invalidDriver', 'validDriver', 'undocumentedUser']).notNullable()
      table.string('avatar').nullable()
      table.string('idCloudinaryAvatar').nullable()
      table.string('cpfcnpj').notNullable().unique()
      table.string('lat').nullable()
      table.string('lng').nullable()
      table.boolean('online').notNullable()
      table.string('onesignal_player_id').nullable()
      table.date('admissionDate').nullable()
      table.boolean('activatedUser').notNullable().defaultTo(true)
      table.boolean('termsAccepted').nullable()
      table.string('bio').nullable()
      table.string('urlSite').nullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UsersSchema