'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const Users = use('App/Models/Base/Users')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

const moment = require('moment')

class AuthController {
  constructor() {}

  /**
   * Test endpoint to check user existence
   */
  async testUser({ request, response }) {
    try {
      const { username } = request.all()
      
      if (!username) {
        return response.status(400).json({
          status: 'error',
          message: 'Username is required'
        })
      }

      // Check by CPF/CNPJ
      const userByCpf = await Users.query()
        .where('cpfcnpj', username)
        .select('id', 'name', 'email', 'cpfcnpj', 'profile', 'typeUser', 'status', 'activatedUser')
        .first()

      // Check by Email
      const userByEmail = await Users.query()
        .where('email', username)
        .select('id', 'name', 'email', 'cpfcnpj', 'profile', 'typeUser', 'status', 'activatedUser')
        .first()

      return response.json({
        status: 'success',
        searchedFor: username,
        userByCpf: userByCpf,
        userByEmail: userByEmail,
        message: 'User lookup completed'
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  /**
   * List all users for debugging
   */
  async listUsers({ response }) {
    try {
      const users = await Users.query()
        .select('id', 'name', 'email', 'cpfcnpj', 'profile', 'typeUser', 'status', 'activatedUser', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10)

      return response.json({
        status: 'success',
        users: users,
        count: users.length,
        message: 'Users listed successfully'
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  /**
   * POST /v2/auth/login
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async login({
    request,
    auth,
    response
  }) {
    try {
      let credential = request.input('params')

      if (!credential) {
        credential = request.post()
      }

      const {
        username,
        password,
        platform
      } = credential

      if (!username || !password) {
        response.status(401)
        response.json(ErrorController.error('user', '00003', null))
        return
      }

      // Find user by CPF/CNPJ (primary method for portal)
      const user = await Users.query()
        .where('cpfcnpj', username)
        .select('id', 'name', 'profile', 'typeUser', 'avatar', 'idCloudinaryAvatar', 'status', 'activatedUser')
        .first()

      if (!user) {
        response.status(404)
        response.json(ErrorController.error('user', '00002', null))
        return
      }

      const {
        typeUser,
        status,
        activatedUser
      } = user

      if (platform !== 'portal') {
        if (typeUser === 'client' || typeUser === 'business') {
          response.status(401)
          response.json(ErrorController.error('user', '00008', null))
          return
        }

        if (status === 'inac') {
          response.status(401)
          response.json(ErrorController.error('user', '00009', null))
          return
        }
      }

      if (!activatedUser) {
        response.status(401)
        response.json(ErrorController.error('user', '00010', null))
        return
      }

      if (await auth.validate(username, password)) {
        const t = await auth.generate(user)
        const claim = platform === 'portal' ? JSON.parse(Buffer.from(t.token.split('.')[1], 'base64').toString()) : null

        const objReturn = {
          status: 'success',
          user: user,
          token: {
            token_type: t.type,
            access_token: t.token,
            refresh_token: platform === 'portal' ? t.refreshToken : null,
            expires_in: platform === 'portal' ? claim.exp - moment().unix() : null,
          }
        }

        response.status(200)
        response.json(objReturn)
      }
    } catch (e) {
      throw e
    }
  }
}

module.exports = AuthController
