'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderInvoice extends Model {
  static boot() {
    super.boot()
    this.addTrait('JsonField')
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'order_invoice'
  }

  get jsonFields() {
    return ['withdraw', 'destiny']
  }

  static get dates() {
    return ['created_at', 'updated_at']
  }

  // Order
  order() {
    return this.hasOne('App/Models/Base/Orders', 'idOrder', 'id')
  }
}

module.exports = OrderInvoice
