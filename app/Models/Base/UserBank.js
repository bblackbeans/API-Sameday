'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserBank extends Model {
  static boot() {
    super.boot()
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'user_bank'
  }

  static get dates() {
    return ['created_at', 'updated_at', 'eventDate']
  }

  user() {
    return this.hasOne('App/Models/Base/Users', 'idUser', 'id')
  }
}

module.exports = UserBank
