'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const User = use('App/Models/Base/Users')
const RecoverPassword = use('App/Models/Base/RecoverPassword')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

/** @type {import('./../../Services/SendSms')} */
const SendSms = use('App/Services/SendSms')

/** @type {import('./../../Utils/functions.utils')} */
const Function = make('App/Utils/functions.utils')

const moment = require('moment')
const Hash = use('Hash')

class RecoverPasswordController {
  constructor() {}

  /**
   * Check if this phone exists in our database, if so send the code for confirmation
   * POST /recover_password
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async step_1({
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
        bodyData = request.all()
      }

      const {
        phone
      } = bodyData

      if (!phone) {
        response.status(404)
        return response.json(ErrorController.error('password', '00001'))
      }

      const user = await User.query()
        .where('phone', phone)
        .select('id', 'phone', 'status')
        .first()

      if (!user) {
        response.status(404)
        response.json(ErrorController.error('password', '00002'))
        return
      }

      if (user.status === 'inac') {
        response.status(401)
        response.json(ErrorController.error('password', '00003'))
        return
      }

      const code = Math.floor(100000 + Math.random() * 900000)

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      await RecoverPassword.create({
        idUser: user.id,
        phone: user.phone,
        code: code,
        status: 'code_pending',
        created_at: date,
        updated_at: date
      })

      await SendSms.sendSMS(user.id, user.phone, 'SameDay: Ninguém da Same Day vai te pedir este dado. Não o compartilhe! Seu código de segurança e: ' + code)

      const objReturn = {
        status: 'success',
        message: 'Código enviado com sucesso!',
        phone: user.phone
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * Check if the code has not expired, if not check if the code passed by the user is correct
   * POST /recover_password/code/validate
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async step_2({
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
        bodyData = request.all()
      }

      const {
        code,
        phone
      } = bodyData

      if (!code) {
        response.status(404)
        return response.json(ErrorController.error('password', '00004'))
      }

      if (!phone) {
        response.status(404)
        return response.json(ErrorController.error('password', '00001'))
      }

      const user = await User.query()
        .where('phone', phone)
        .select('id', 'phone', 'status')
        .first()

      if (!user) {
        response.status(404)
        response.json(ErrorController.error('user', '00001'))
        return
      }

      if (user.status === 'inac') {
        response.status(401)
        response.json(ErrorController.error('password', '00003'))
        return
      }

      const passwordRecord = await RecoverPassword.query()
        .where('idUser', user.id)
        .where('phone', phone)
        .orderBy('created_at', 'DESC')
        .first()

      if (!passwordRecord) {
        response.status(404)
        response.json(ErrorController.error('password', '00005'))
        return
      }

      const recordCreationDateAndTime = moment(passwordRecord.created_at).format('YYYY-MM-DD HH:mm:ss')

      const now = moment().format('YYYY-MM-DD HH:mm:ss')

      const diffMinutes = moment(now).diff(moment(recordCreationDateAndTime), 'minutes')

      if (diffMinutes > 60) {
        await RecoverPassword.query()
          .where('id', passwordRecord.id)
          .update({
            status: 'code_expired',
            updated_at: now
          })

        response.status(401)
        response.json(ErrorController.error('password', '00006'))
        return
      }

      if (code !== passwordRecord.code) {
        await RecoverPassword.query()
          .where('id', passwordRecord.id)
          .update({
            status: 'code_invalid',
            updated_at: now
          })

        response.status(401)
        response.json(ErrorController.error('password', '00007'))
        return
      }

      await RecoverPassword.query()
        .where('id', passwordRecord.id)
        .update({
          status: 'code_confirmed',
          updated_at: now
        })

      const objReturn = {
        status: 'success',
        message: 'Código autenticado com sucesso!',
        phone: user.phone
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * Change password
   * POST /recover_password/change
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async step_3({
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
        bodyData = request.all()
      }

      const {
        phone,
        password
      } = bodyData

      if (!phone) {
        response.status(404)
        return response.json(ErrorController.error('password', '00001'))
      }

      const user = await User.query()
        .where('phone', phone)
        .select('id', 'status')
        .first()

      if (!user) {
        response.status(404)
        response.json(ErrorController.error('user', '00001'))
        return
      }

      if (user.status === 'inac') {
        response.status(401)
        response.json(ErrorController.error('password', '00003'))
        return
      }

      if (!Function.validateStrongPassword(password)) {
        response.status(401)
        response.json(ErrorController.error('password', '00008'))
        return
      }

      const now = moment().format('YYYY-MM-DD HH:mm:ss')

      await RecoverPassword.query()
        .where('idUser', user.id)
        .where('status', 'code_confirmed')
        .orderBy('created_at', 'DESC')
        .update({
          status: 'approved_change',
          updated_at: now
        })

      async function hashPassword(_pass) {
        return await Hash.make(_pass)
      }

      await User.query()
        .where('id', user.id)
        .update({
          password: await hashPassword(password),
          updated_at: now
        })

      const objReturn = {
        status: 'success',
        message: 'Senha alterada com sucesso!'
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

}

module.exports = RecoverPasswordController