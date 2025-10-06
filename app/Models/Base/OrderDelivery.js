'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderDelivery extends Model {
  static boot() {
    super.boot()
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'order_delivery'
  }

  static get dates() {
    return ['created_at', 'updated_at', 'eventDate']
  }

  driver() {
    return this.hasOne('App/Models/Base/Users', 'idDriver', 'id')
  }

  order() {
    return this.hasOne('App/Models/Base/Orders', 'idOrder', 'id')
  }
}

module.exports = OrderDelivery
