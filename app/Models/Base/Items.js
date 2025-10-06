'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Items extends Model {
  static boot() {
    super.boot()
  }

  static get table() {
    return 'items'
  }

  static get dates() {
    return ['created_at', 'updated_at']
  }

  order() {
    return this.belongsTo('App/Models/Base/Orders')
  }
}

module.exports = Items
