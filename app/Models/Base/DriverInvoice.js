'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DriverInvoice extends Model {
  static boot() {
    super.boot()
  }

  static get table() {
    return 'driver_invoice'
  }

  static get dates() {
    return ['created_at', 'updated_at']
  }

  // all order
  orders() {
    return this.hasMany('App/Models/Base/Orders', 'id', 'idDriverInvoice')
  }

  // Driver
  driver() {
    return this.hasOne('App/Models/Base/Users', 'idDriver', 'id')
  }
}

module.exports = DriverInvoice
