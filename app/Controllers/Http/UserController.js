'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const Users = use('App/Models/Base/Users')
const Addresses = use('App/Models/Base/Addresses')
const Documents = use('App/Models/Base/Documents')
const ValidateDriver = use('App/Models/Base/ValidateDriver')
const DeliveryVehicles = use('App/Models/Base/DeliveryVehicles')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

// Services
/** @type {import('../../Services/Cloudinary')} */
const Cloudinary = use('App/Services/Cloudinary')
/** @type {import('../../Services/SendSms')} */
const SendSms = use('App/Services/SendSms')
/** @type {import('../../Services/Shared')} */
const Shared = use('App/Services/Shared')

const moment = require('moment')
const _ = require('lodash')
const Hash = use('Hash')

class UserController {
  constructor() {}

  /**
   * GET /user
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getUser({
    auth,
    request,
    response
  }) {
    try {

      const bodyData = request.get()

      let idUser = 0
      if (bodyData.idSelectedUser) {
        idUser = bodyData.idSelectedUser
      } else if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
        idUser = auth.user.id
      }

      if (!idUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001', null, 'ID de usuário não informado!'))
      }

      const user = await Users.query()
        .where('id', idUser)
        .with('address')
        .with('documents')
        .with('validateDriver', (v) => {
          v.select('id', 'idUser', 'category', 'status', 'reason')
        })
        .with('deliveryVehicles')
        .select('id', 'name', 'fantasyName', 'phone', 'email', 'status', 'profile', 'typeUser', 'documentsValidated', 'cpfcnpj',
          'urlSite', 'online', 'bio', 'termsAccepted', 'activatedUser')
        .first()

      if (!user) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      const objReturn = {
        status: 'success',
        message: 'Usuário carregado com sucesso!',
        user: user
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * GET /user/all
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getUserAll({
    auth,
    request,
    response
  }) {
    try {

      let totals = {
        statusAll: 0,
        statusUser: 0,
        statusDriver: 0,
        statusBusiness: 0,
        driverDocValido: 0,
        driverDocInvalido: 0
      }

      let idUser = 0
      if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
        idUser = auth.user.id
      }

      let existsUser = await Users.query()
        .where('id', idUser)
        .select('id', 'profile')
        .first()

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (existsUser.profile !== 'administrator') {
        response.status(401)
        return response.json(ErrorController.error('error', '00005', null))
      }

      const allUsers = await Users.query()
        .select('id', 'status', 'typeUser', 'documentsValidated', 'name', 'cpfcnpj', 'phone')
        .fetch()

      if (allUsers.rows.length) {
        totals = {
          statusAll: allUsers.rows.length,
          statusUser: allUsers.rows.filter((row) => row.typeUser === 'client').length,
          statusDriver: allUsers.rows.filter((row) => row.typeUser === 'driver').length,
          statusBusiness: allUsers.rows.filter((row) => row.typeUser === 'business').length,
          driverDocValido: allUsers.rows.filter((row) => row.typeUser === 'driver' && row.documentsValidated === 'validDriver').length,
          driverDocInvalido: allUsers.rows.filter((row) => row.typeUser === 'driver' && row.documentsValidated === 'invalidDriver').length,
        }
      }

      const objReturn = {
        status: 'success',
        message: 'Usuários carregado com sucesso!',
        users: allUsers,
        totals: totals
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * POST /user
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async postUser({
    request,
    response
  }) {
    try {

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        typeOfUser,
        user
      } = bodyData

      // Validation of existence
      if (user.data.cpfcnpj) {
        const cpfcnpjExists = await Users.query().where('cpfcnpj', user.data.cpfcnpj).first()
        const typeCode = typeOfUser === 'business' ? '00007' : '00006'

        if (cpfcnpjExists) {
          response.status(400)
          return response.json(ErrorController.error('user', typeCode, null))
        }
      }

      if (user.contact.phone) {
        const phoneExists = await Users.query().where('phone', user.contact.phone).first()

        if (phoneExists) {
          response.status(400)
          return response.json(ErrorController.error('user', '00012', null))
        }
      }

      if (user.contact.email) {
        const emailExists = await Users.query().where('email', user.contact.email).first()

        if (emailExists) {
          response.status(400)
          return response.json(ErrorController.error('user', '00005', null))
        }
      }

      async function hashPassword(_pass) {
        return await Hash.make(_pass)
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      // Users
      let createUser = await Users.create({
        name: user.data.name,
        fantasyName: typeOfUser === 'business' ? user.data.fantasyName : null,
        phone: user.contact.phone,
        email: user.contact.email.toLowerCase(),
        password: await hashPassword(user.password),
        status: typeOfUser === 'driver' ? 'inac' : 'active',
        profile: typeOfUser === 'driver' ? 'driver' : 'client',
        documentsValidated: typeOfUser === 'driver' ? 'invalidDriver' : 'undocumentedUser',
        typeUser: typeOfUser,
        cpfcnpj: user.data.cpfcnpj,
        urlSite: user.contact.urlSite,
        online: false,
        termsAccepted: true,
        activatedUser: true,
        created_at: date,
        updated_at: date
      })

      // Get latitude and longitude through address
      const resGoogleGeometry = await Shared.getLatLngThroughAddress(user.address)
      let lat = null
      let lng = null

      if (resGoogleGeometry && resGoogleGeometry.status === 'OK') {
        const data = resGoogleGeometry.results[0]
        lat = data.geometry.location.lat
        lng = data.geometry.location.lng
      }

      // Addresses
      await Addresses.create({
        idUser: createUser.id,
        address: user.address.address,
        number: user.address.number,
        complement: user.address.complement,
        district: user.address.district,
        zipCode: user.address.zipCode,
        state: user.address.state,
        city: user.address.city,
        latitude: lat,
        longitude: lng,
        created_at: date,
        updated_at: date
      })

      if (typeOfUser === 'driver') {
        // DeliveryVehicles
        await DeliveryVehicles.create({
          idUser: createUser.id,
          brand: user.vehicle.brand,
          model: user.vehicle.model,
          year: user.vehicle.year,
          color: user.vehicle.color,
          plate: user.vehicle.plate,
          renavam: user.vehicle.renavam,
          width: user.vehicle.width,
          conversion_width: user.vehicle.conversion_width,
          height: user.vehicle.height,
          conversion_height: user.vehicle.conversion_height,
          length: user.vehicle.length,
          conversion_length: user.vehicle.conversion_length,
          weight: user.vehicle.weight,
          conversion_weight: user.vehicle.conversion_weight,
          category: user.vehicle.category,
          created_at: date,
          updated_at: date
        })

        // Documents
        Object.keys(user.documents).forEach(async (model) => {
          // ValidateDriver
          await ValidateDriver.create({
            idUser: createUser.id,
            category: model,
            status: 'pending',
            reason: null,
            created_at: date,
            updated_at: date
          })

          user.documents[model].forEach(async (doc) => {
            await Documents.create({
              idUser: createUser.id,
              category: model,
              name: doc.name,
              idCloudinary: doc.idCloudinary,
              url: doc.url,
              created_at: date,
              updated_at: date
            })
          })
        })
      }

      const objReturn = {
        status: 'success',
        message: 'Usuário cadastrado com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * PUT /user
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async putUser({
    auth,
    request,
    response
  }) {
    try {

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        typeOfUser,
        user
      } = bodyData

      let idUser = 0
      if (bodyData.idSelectedUser) {
        idUser = bodyData.idSelectedUser
      } else if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
        idUser = auth.user.id
      }

      if (!idUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001', null, 'ID de usuário não informado!'))
      }

      let existsUser = await Users.find(idUser)

      if (user.data.cpfcnpj) {
        const cpfcnpjExists = await Users.query().select('id').where('cpfcnpj', user.data.cpfcnpj).where('id', '!=', idUser).first()
        const typeCode = typeOfUser === 'business' ? '00007' : '00006'

        if (cpfcnpjExists) {
          response.status(400)
          return response.json(ErrorController.error('user', typeCode, null))
        }
      }

      if (user.contact.phone) {
        const phoneExists = await Users.query().where('phone', user.contact.phone).where('id', '!=', idUser).first()

        if (phoneExists) {
          response.status(400)
          return response.json(ErrorController.error('user', '00012', null))
        }
      }

      if (user.contact.email) {
        const emailExists = await Users.query().select('id').where('email', user.contact.email).where('id', '!=', idUser).first()

        if (emailExists) {
          response.status(400)
          return response.json(ErrorController.error('user', '00005', null))
        }
      }

      async function hashPassword(_pass) {
        return await Hash.make(_pass)
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      if (!existsUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001'))

      } else {
        if (existsUser.profile === 'administrator' && !user.activatedUser) {
          response.status(400)
          return response.json(ErrorController.error('user', '00011'))
        }

        // Users
        await Users.query()
          .where('id', idUser)
          .update({
            name: user.data.name,
            fantasyName: existsUser.typeUser === 'business' ? user.data.fantasyName : null,
            cpfcnpj: user.data.cpfcnpj,
            phone: user.contact.phone,
            urlSite: user.contact.urlSite,
            activatedUser: user.activatedUser,
            email: user.contact.email.toLowerCase(),
            password: user.password ? await hashPassword(user.password) : existsUser.password,
            updated_at: date
          })

        if (existsUser.typeUser === 'driver') {
          // DeliveryVehicles
          let existsDeliveryVehicles = await DeliveryVehicles.query().where('idUser', idUser).first()

          if (!existsDeliveryVehicles) {
            await DeliveryVehicles.create({
              idUser: idUser,
              brand: user.vehicle.brand,
              model: user.vehicle.model,
              year: user.vehicle.year,
              color: user.vehicle.color,
              plate: user.vehicle.plate,
              renavam: user.vehicle.renavam,
              width: user.vehicle.width,
              conversion_width: user.vehicle.conversion_width,
              height: user.vehicle.height,
              conversion_height: user.vehicle.conversion_height,
              length: user.vehicle.length,
              conversion_length: user.vehicle.conversion_length,
              weight: user.vehicle.weight,
              conversion_weight: user.vehicle.conversion_weight,
              category: user.vehicle.category,
              created_at: date,
              updated_at: date
            })
          } else {
            await DeliveryVehicles.query()
              .where('idUser', idUser)
              .update({
                brand: user.vehicle.brand,
                model: user.vehicle.model,
                year: user.vehicle.year,
                color: user.vehicle.color,
                plate: user.vehicle.plate,
                renavam: user.vehicle.renavam,
                width: user.vehicle.width,
                conversion_width: user.vehicle.conversion_width,
                height: user.vehicle.height,
                conversion_height: user.vehicle.conversion_height,
                length: user.vehicle.length,
                conversion_length: user.vehicle.conversion_length,
                weight: user.vehicle.weight,
                conversion_weight: user.vehicle.conversion_weight,
                category: user.vehicle.category,
                updated_at: date
              })
          }

          // Documents
          let arrayCategorySave = []
          Object.keys(user.documents).forEach(async (model) => {
            user.documents[model].forEach(async (doc) => {
              if (!doc.id) {
                arrayCategorySave.push(model)

                await Documents.create({
                  idUser: idUser,
                  category: model,
                  name: doc.name,
                  idCloudinary: doc.idCloudinary,
                  url: doc.url,
                  created_at: date,
                  updated_at: date
                })
              }
            })
          })

          // ValidateDriver
          if (arrayCategorySave.length) {
            const treatArray = _.uniq(arrayCategorySave)

            treatArray.forEach(async (model) => {
              await ValidateDriver.query()
                .where('idUser', idUser)
                .where('category', model)
                .update({
                  category: model,
                  status: 'pending',
                  reason: null,
                  updated_at: date
                })
            })
          }
        }

        // Get latitude and longitude through address
        const resGoogleGeometry = await Shared.getLatLngThroughAddress(user.address)
        let lat = null
        let lng = null

        if (resGoogleGeometry && resGoogleGeometry.status === 'OK') {
          const data = resGoogleGeometry.results[0]
          lat = data.geometry.location.lat
          lng = data.geometry.location.lng
        }

        // Addresses
        let existsAddress = await Addresses.query().where('idUser', idUser).first()

        if (!existsAddress) {
          await Addresses.create({
            idUser: idUser,
            address: user.address.address,
            number: user.address.number,
            complement: user.address.complement,
            district: user.address.district,
            zipCode: user.address.zipCode,
            state: user.address.state,
            city: user.address.city,
            latitude: lat,
            longitude: lng,
            created_at: date,
            updated_at: date
          })
        } else {
          await Addresses.query()
            .where('idUser', idUser)
            .update({
              address: user.address.address,
              number: user.address.number,
              complement: user.address.complement,
              district: user.address.district,
              zipCode: user.address.zipCode,
              state: user.address.state,
              city: user.address.city,
              latitude: lat,
              longitude: lng,
              updated_at: date
            })
        }

        const activatedUser1 = existsUser.activatedUser ? true : false;
        const activatedUser2 = user.activatedUser ? true : false;

        if (activatedUser1 != activatedUser2) {
          await SendSms.enableDisableRegistration(idUser, user.contact.phone, user.activatedUser)
        }
      }

      const objReturn = {
        status: 'success',
        message: 'Identificação atualizada com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * POST /user/driver/validate
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async postValidateDriver({
    request,
    response
  }) {
    try {
      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        idSelectedUser,
        category,
        reason,
        action
      } = bodyData

      let idUser = 0
      if (idSelectedUser) {
        idUser = idSelectedUser
      }

      if (!idUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001', null, 'ID de usuário não informado!'))
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      // ValidateDriver
      await ValidateDriver.query()
        .where('idUser', idUser)
        .where('category', category)
        .update({
          status: action,
          reason: reason ? reason : null,
          updated_at: date
        })

      // Check if driver can be active
      const arrayStatus = (await ValidateDriver.query()
        .where('idUser', idUser)
        .select('id', 'status')
        .fetch()).toJSON()

      const saveStatusApproved = []
      arrayStatus.forEach(category => {
        if (category.status === 'approved') {
          saveStatusApproved.push(category)
        }
      })

      // Active driver
      if (saveStatusApproved.length === 6) {
        // Users
        await Users.query()
          .where('id', idUser)
          .update({
            status: 'active',
            documentsValidated: 'validDriver',
            updated_at: date
          })
      } else {
        await Users.query()
          .where('id', idUser)
          .update({
            documentsValidated: 'invalidDriver',
            updated_at: date
          })
      }

      await SendSms.driverValidationAlert(idUser, action, category, reason)

      const objReturn = {
        status: 'success',
        message: 'Validação feita com sucesso!',
        idUser: idUser
      }

      response.status(200)
      response.json(objReturn)

    } catch (e) {
      throw e
    }
  }

  /**
   * Update profile picture
   * PUT /user/avatar
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async putProfilePicture({
    auth,
    request,
    response
  }) {
    try {

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        currentAvatar,
        url
      } = bodyData

      let idUser = 0
      if (bodyData.idSelectedUser) {
        idUser = bodyData.idSelectedUser
      } else if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
        idUser = auth.user.id
      }

      if (!idUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001', null, 'ID de usuário não informado!'))
      }

      if (!url) {
        response.status(404)
        return response.json(ErrorController.error('upload', '00003'))
      }

      let idCloudinaryQuard = ''
      currentAvatar.forEach(avatar => {
        if (avatar.idCloudinary) {
          idCloudinaryQuard = avatar.idCloudinary
        }
      })

      if (idCloudinaryQuard) {
        await Cloudinary.destroy([idCloudinaryQuard])
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      const resultCloudinary = await Cloudinary.upload(url)

      await Users.query()
        .where('id', idUser)
        .update({
          avatar: resultCloudinary.url.secure_url,
          idCloudinaryAvatar: resultCloudinary.url.public_id,
          updated_at: date
        })

      const objReturn = {
        status: 'success',
        data: resultCloudinary
      }

      response.status(200)
      response.json(objReturn)

    } catch (error) {
      response.status(500)
      return response.json(ErrorController.error('upload', '00002', error.message))
    }
  }

  async updateOneSignalPlayerId({ request, params, response }) {
    try {
      const { userId } = params

      const user = await Users.findOrFail(userId)
      user.merge(request.all())
      user.save()

      return user
    } catch (error) {
      response.status(500)
      return response.json(ErrorController.error('user', '00001', error.message))
    }
  }
}

module.exports = UserController
