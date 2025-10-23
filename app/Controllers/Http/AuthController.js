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
   * POST /v2/auth/debug-password
   * Endpoint para debug da senha
   */
  async debugPassword({ request, response }) {
    try {
      const { username, password } = request.post()
      
      if (!username || !password) {
        return response.status(400).json({
          status: 'error',
          message: 'Username e password são obrigatórios'
        })
      }

      // Limpar CPF/CNPJ
      const cleanCpfCnpj = username.replace(/[^\d]/g, '')

      // Buscar usuário com senha
      const user = await Users.query()
        .where('cpfcnpj', cleanCpfCnpj)
        .select('id', 'name', 'email', 'cpfcnpj', 'password', 'activatedUser')
        .first()

      if (!user) {
        return response.json({
          status: 'error',
          message: 'Usuário não encontrado',
          data: { username, cleanCpfCnpj }
        })
      }

      // Testar verificação de senha
      const Hash = use('Hash')
      const isPasswordValid = await Hash.verify(password, user.password)

      return response.json({
        status: 'success',
        message: 'Debug de senha realizado',
        data: {
          username: username,
          cleanCpfCnpj: cleanCpfCnpj,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            cpfcnpj: user.cpfcnpj,
            activatedUser: user.activatedUser,
            passwordLength: user.password ? user.password.length : 0,
            passwordStart: user.password ? user.password.substring(0, 10) + '...' : 'null'
          },
          passwordTest: {
            inputPassword: password,
            isPasswordValid: isPasswordValid
          }
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        error: error.message
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

      // Validação: Verificar se username e password estão corretos
      if (!username || !password) {
        return response.status(400).json({
          status: 'error',
          message: 'Username e password são obrigatórios'
        })
      }

      // Limpar CPF/CNPJ (remover formatação)
      const cleanCpfCnpj = username.replace(/[^\d]/g, '')

      // Buscar usuário por CPF/CNPJ
      const user = await Users.query()
        .where('cpfcnpj', cleanCpfCnpj)
        .select('id', 'name', 'email', 'phone', 'profile', 'typeUser', 'avatar', 'idCloudinaryAvatar', 'status', 'activatedUser', 'cpfcnpj', 'password')
        .first()

      if (!user) {
        return response.status(404).json({
          status: 'error',
          message: 'Usuário não cadastrado em nossa base.'
        })
      }

      // Verificar se usuário está ativo
      if (!user.activatedUser) {
        return response.status(401).json({
          status: 'error',
          message: 'Usuário não ativado.'
        })
      }

      // Verificar senha usando Hash.verify diretamente
      const Hash = use('Hash')
      
      // Debug: Log da comparação
      console.log('Debug Login:', {
        inputPassword: password,
        storedPassword: user.password,
        passwordLength: user.password ? user.password.length : 0
      })
      
      const isPasswordValid = await Hash.verify(password, user.password)
      
      console.log('Password verification result:', isPasswordValid)

      if (!isPasswordValid) {
        return response.status(401).json({
          status: 'error',
          message: 'Senha de usuário inválida.',
          debug: {
            inputPassword: password,
            storedPasswordLength: user.password ? user.password.length : 0,
            verificationResult: isPasswordValid
          }
        })
      }

      // Geração de Token: Criar JWT com informações do usuário
      const token = await auth.generate(user)

      // Resposta: Retornar token + dados do usuário
      const responseData = {
        status: 'success',
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpfcnpj: user.cpfcnpj,
          profile: user.profile,
          typeUser: user.typeUser,
          avatar: user.avatar,
          status: user.status
        },
        token: {
          token_type: 'bearer',
          access_token: token.token,
          expires_in: 2678400 // 31 dias em segundos
        }
      }

      // Para portal, adicionar refresh token
      if (platform === 'portal' && token.refreshToken) {
        responseData.token.refresh_token = token.refreshToken
      }

      return response.status(200).json(responseData)

    } catch (error) {
      console.error('Erro no login:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }
}

module.exports = AuthController
