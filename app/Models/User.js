'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens() {
    return this.hasMany('App/Models/Token')
  }

  /**
   * Get vehicle data as JSON
   */
  getVehicleData() {
    return this.vehicleData ? JSON.parse(this.vehicleData) : null
  }

  /**
   * Set vehicle data as JSON
   */
  setVehicleData(value) {
    this.vehicleData = value ? JSON.stringify(value) : null
  }

  /**
   * Get payment data as JSON
   */
  getPaymentData() {
    return this.paymentData ? JSON.parse(this.paymentData) : null
  }

  /**
   * Set payment data as JSON
   */
  setPaymentData(value) {
    this.paymentData = value ? JSON.stringify(value) : null
  }
}

module.exports = User
