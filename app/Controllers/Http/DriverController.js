'use strict'

const User = use('App/Models/Base/Users')
const Hash = use('Hash')

class DriverController {
  async register({ request, response }) {
    try {
      const name = request.input('name')
      const email = request.input('email')
      const phone = request.input('phone')
      const cpf = request.input('cpf')
      const birthDate = request.input('birthDate')
      const password = request.input('password')
      const vehicleType = request.input('vehicleType')

      if (!name || !email || !phone || !cpf || !birthDate || !password || !vehicleType) {
        return response.status(400).json({
          status: 'error',
          message: 'Todos os campos são obrigatórios'
        })
      }

      const user = await User.create({
        name,
        email,
        phone,
        cpfcnpj: cpf,
        birth_date: birthDate,
        vehicle_type: vehicleType,
        password: password,
        profile: 'driver',
        typeUser: 'driver',
        status: 'active',
        documentsValidated: 'undocumentedUser',
        online: false,
        termsAccepted: true,
        activatedUser: true
      })

      return response.status(201).json({
        status: 'success',
        message: 'Entregador cadastrado com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpfcnpj,
          birthDate: user.birthDate,
          vehicleType: user.vehicleType,
          status: user.status,
          createdAt: user.created_at
        }
      })
    } catch (error) {
      console.error('Erro ao cadastrar entregador:', error)
      
      if (error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT') {
        return response.status(409).json({
          status: 'error',
          message: 'Email ou CPF já cadastrado'
        })
      }

      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  async login({ request, response, auth }) {
    try {
      const email = request.input('email')
      const password = request.input('password')

      if (!email || !password) {
        return response.status(400).json({
          status: 'error',
          message: 'Email e senha são obrigatórios'
        })
      }

      const user = await User.query()
        .where('email', email)
        .where('profile', 'driver')
        .first()

      if (!user) {
        return response.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        })
      }

      const isPasswordValid = await Hash.verify(password, user.password)

      if (!isPasswordValid) {
        return response.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        })
      }

      const token = await auth.generate(user)

      return response.json({
        status: 'success',
        message: 'Login realizado com sucesso!',
        token: token.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpfcnpj,
          birthDate: user.birthDate,
          vehicleType: user.vehicleType,
          status: user.status,
          role: user.profile
        }
      })
    } catch (error) {
      console.error('Erro no login:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  async forgotPassword({ request, response }) {
    try {
      const email = request.input('email')

      if (!email) {
        return response.status(400).json({
          status: 'error',
          message: 'Email é obrigatório'
        })
      }

      const user = await User.query()
        .where('email', email)
        .where('profile', 'driver')
        .first()

      if (!user) {
        return response.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        })
      }

      const resetToken = 'reset-token-' + Date.now()

      return response.json({
        status: 'success',
        message: 'Instruções de redefinição enviadas para seu email!',
        resetToken
      })
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  async resetPassword({ request, response }) {
    try {
      const token = request.input('token')
      const newPassword = request.input('newPassword')

      if (!token || !newPassword) {
        return response.status(400).json({
          status: 'error',
          message: 'Token e nova senha são obrigatórios'
        })
      }

      if (!token.startsWith('reset-token-')) {
        return response.status(400).json({
          status: 'error',
          message: 'Token inválido'
        })
      }

      const user = await User.query()
        .where('profile', 'driver')
        .first()

      if (!user) {
        return response.status(404).json({
          status: 'error',
          message: 'Token inválido ou expirado'
        })
      }

      user.password = await Hash.make(newPassword)
      await user.save()

      return response.json({
        status: 'success',
        message: 'Senha redefinida com sucesso!'
      })
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  async logout({ auth, response }) {
    try {
      await auth.logout()

      return response.json({
        status: 'success',
        message: 'Logout realizado com sucesso!'
      })
    } catch (error) {
      console.error('Erro no logout:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  async getStats({ auth, response }) {
    try {
      const user = await auth.getUser()

      // Simular estatísticas por enquanto
      const stats = {
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        totalEarnings: 0,
        totalDistance: 0,
        averageRating: 0,
        successRate: 0,
        averageDeliveryTime: 0,
        weeklyStats: {
          deliveries: 0,
          earnings: 0,
          distance: 0
        },
        monthlyStats: {
          deliveries: 0,
          earnings: 0,
          distance: 0
        }
      }

      return response.json({
        status: 'success',
        stats
      })
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }
}

module.exports = DriverController
