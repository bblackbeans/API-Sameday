'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Orders extends Model {
  static boot() {
    super.boot()
  }

  static get table() {
    return 'orders'
  }

  static get dates() {
    return ['dateCollect', 'dateDelivery', 'created_at', 'updated_at']
  }

  // Customer who placed the order
  userClient() {
    return this.hasOne('App/Models/Base/Users', 'idUser', 'id')
  }

  // Driver who won a delivery in the draw
  userDriver() {
    return this.hasOne('App/Models/Base/Users', 'idDriver', 'id')
  }

  // Order information
  orderInformation() {
    return this.hasOne('App/Models/Base/OrderInformation', 'id', 'idOrder')
  }

  // all order items
  items() {
    return this.hasMany('App/Models/Base/Items', 'id', 'idOrder')
  }

  // Order invoice
  orderInvoice() {
    return this.hasOne('App/Models/Base/OrderInvoice', 'id', 'idOrder')
  }

  // Order invoice
  driverInvoice() {
    return this.hasOne('App/Models/Base/DriverInvoice', 'idDriverInvoice', 'id')
  }

  verificationCodeCollectAndDestinationDriver() {
    return this.hasMany('App/Models/Base/VerificationCodeCollectAndDestination', 'id', 'idOrder')
  }
}

module.exports = Orders
