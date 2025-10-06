'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Users extends Model {
  static boot() {
    super.boot()
    this.addTrait('NoTimestamp')
  }

  static get table() {
    return 'users'
  }

  static get dates() {
    return ['admissionDate', 'created_at', 'updated_at']
  }

  static get foreignKey() {
    return 'idUser'
  }

  tokens() {
    return this.hasMany('App/Models/Token', 'id', 'idUser')
  }

  validateDriver() {
    return this.hasMany('App/Models/Base/ValidateDriver', 'id', 'idUser')
  }

  documents() {
    return this.hasMany('App/Models/Base/Documents', 'id', 'idUser')
  }

  address() {
    return this.hasOne('App/Models/Base/Addresses', 'id', 'idUser')
  }

  deliveryVehicles() {
    return this.hasOne('App/Models/Base/DeliveryVehicles', 'id', 'idUser')
  }

  recoverPassword() {
    return this.hasMany('App/Models/Base/RecoverPassword', 'id', 'idUser')
  }

  driverOrders() {
    return this.hasMany('App/Models/Base/Orders', 'id', 'idDriver')
  }

  verificationCodeCollectAndDestinationDriver() {
    return this.hasMany('App/Models/Base/VerificationCodeCollectAndDestination', 'id', 'idDriver')
  }
}

module.exports = Users
