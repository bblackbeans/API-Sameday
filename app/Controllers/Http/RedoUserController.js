'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const Users = use('App/Models/Base/Users')
const Addresses = use('App/Models/Base/Addresses')
const DeliveryVehicles = use('App/Models/Base/DeliveryVehicles')

// Services
/** @type {import('../../Services/Cloudinary')} */
const CloudinaryService = use('App/Services/Cloudinary')

class RedoUserController {
  async show({
    params
  }) {
    const user = await Users.query().where('id', params.id).with('address').with('deliveryVehicles').fetch()

    return user
  }

  async getDriverStatus({
    params
  }) {
    try {
      const status = await Users.query().where('id', params.id).where('typeUser', 'driver').select('online').fetch()

      return status
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }

  async updateStatus({
    params,
    request
  }) {
    const status = await Users.findOrFail(params.id)

    status.merge(request.all())

    status.save()

    return status
  }

  async updateAvatar({
    params,
    request
  }) {
    try {
      const user = await Users.findOrFail(params.id)

      const file = request.file('image')
      const cloudinaryResponse = await CloudinaryService.upload(file.tmpPath)

      user.merge({
        avatar: cloudinaryResponse.url.secure_url
      })
      user.save()

      return user
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }
}

module.exports = RedoUserController
