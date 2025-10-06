'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class RecoverPassword extends Model {
  static boot() {
    super.boot()
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'recover_password'
  }

  static get dates() {
    return ['created_at', 'updated_at']
  }

  static get foreignKey() {
    return 'idRecoverPassword'
  }

  user() {
    return this.hasOne('App/Models/Base/Users', 'idUser', 'id')
  }
}

module.exports = RecoverPassword