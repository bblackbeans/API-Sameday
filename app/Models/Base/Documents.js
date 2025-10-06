'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Documents extends Model {
  static boot() {
    super.boot()
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'documents'
  }

  static get dates() {
    return ['emissionDate', 'created_at', 'updated_at']
  }

  user() {
    return this.hasOne('App/Models/Base/Users', 'idUser', 'id')
  }
}

module.exports = Documents
