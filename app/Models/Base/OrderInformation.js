'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderInformation extends Model {
  static boot() {
    super.boot()
    this.addTrait('JsonField')
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'order_information'
  }

  get jsonFields() {
    return ['withdraw', 'destiny']
  }

  static get dates() {
    return ['created_at', 'updated_at']
  }

}

module.exports = OrderInformation
