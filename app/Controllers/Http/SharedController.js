'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

// Models
const Users = use('App/Models/Base/Users')

// Services
/** @type {import('../../Services/Shared')} */
const Shared = use('App/Services/Shared')

const axios = require('axios')

class SharedController {

  /**
   * GET /zipe_code
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getZipCode({
    request,
    response
  }) {
    const {
      zipCode
    } = request.get()

    try {
      const url = `https://viacep.com.br/ws/${zipCode}/json/`

      const result = await axios.get(url)

      const {
        data
      } = result

      if (data.hasOwnProperty('erro')) {
        response.status(404)
        return response.json(ErrorController.error('shared', '00001', null, 'Verifique-o e tente novamente.'))

      } else {
        const objReturn = {
          status: 'success',
          message: 'CEP carregado com sucesso!',
          data: data
        }

        response.status(200)
        response.json(objReturn)
      }
    } catch (error) {
      try {
        const url = `https://opencep.com/v1/${zipCode}.json`

        const result = await axios.get(url)

        const {
          data
        } = result

        if (data.hasOwnProperty('erro')) {
          response.status(404)
          return response.json(ErrorController.error('shared', '00001', null, 'Verifique-o e tente novamente.'))

        } else {
          const objReturn = {
            status: 'success',
            message: 'CEP carregado com sucesso!',
            data: data
          }

          response.status(200)
          response.json(objReturn)
        }
      } catch (error) {
        throw error
      }
    }
  }

  /**
   * GET /address/lat_lng
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getLatLngThroughAddress({
    request,
    response
  }) {
    try {
      const address = request.get()

      const resGoogleGeometry = await Shared.getLatLngThroughAddress(address)
      let lat = null
      let lng = null

      if (resGoogleGeometry && resGoogleGeometry.status === 'OK') {
        const data = resGoogleGeometry.results[0]
        lat = data.geometry.location.lat
        lng = data.geometry.location.lng

      } else {
        response.status(404)
        return response.json(ErrorController.error('shared', '00002'))
      }

      const objReturn = {
        status: 'success',
        message: 'Latitude e Longitude carregado com sucesso!',
        location: {
          lat: lat,
          lng: lng
        }
      }

      response.status(200)
      response.json(objReturn)
    } catch (error) {
      throw error
    }
  }

  async sendSms({
    request,
    response
  }) {
    try {
      const url = 'https://api.smsdev.com.br/v1/send'

      const key = process.env.SMS_API_KEY

      const {
        number,
        message
      } = request.all()

      const bodySend = {
        key,
        type: 9,
        number,
        msg: message
      }

      const result = await axios.post(url, bodySend)

      const {
        data
      } = result

      if (data.hasOwnProperty('erro')) {
        response.status(404)
        return response.json(ErrorController.error('shared', '00001', null, 'Verifique-o e tente novamente.'))
      } else {
        const objReturn = {
          status: 'success',
          message: 'SMS Enviado com sucesso!',
          data: data
        }

        response.status(200)
        response.json(objReturn)
      }
    } catch (error) {
      throw error;
    }
  }

  async getAuthenticateUser(auth) {

    let user = null;

    /** Get and check authenticate user */
    let idUser = 0
    if (auth.user) {
      idUser = auth.user.id
    }

    if (!idUser) return user;

    const authenticateUser = (await Users.query()
      .where('id', idUser)
      .select('id', 'name', 'fantasyName', 'phone', 'email', 'status', 'profile', 'typeUser', 'cpfcnpj', 'activatedUser')
      .first()).toJSON()

    if (!authenticateUser) return user;
    return authenticateUser;
  }
}

module.exports = SharedController
