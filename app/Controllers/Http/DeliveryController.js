'use strict'

class DeliveryController {
  // Listar entregas disponíveis
  async getAvailable({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)

      // Por enquanto, retornar dados mockados para demonstração
      const mockDeliveries = [
        {
          id: '1',
          origin: {
            address: 'Rua das Flores, 123',
            district: 'Centro',
            latitude: -23.5505,
            longitude: -46.6333
          },
          destination: {
            address: 'Av. Paulista, 1000',
            district: 'Bela Vista',
            latitude: -23.5618,
            longitude: -46.6565
          },
          value: 25.50,
          distance: 2800,
          estimatedTime: 45,
          description: 'Entrega de documentos importantes',
          customer: {
            name: 'Maria Silva',
            phone: '+55 11 99999-9999'
          },
          items: [
            { name: 'Documentos', quantity: 1 },
            { name: 'Envelope lacrado', quantity: 1 }
          ],
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          origin: {
            address: 'Rua Augusta, 500',
            district: 'Consolação',
            latitude: -23.5505,
            longitude: -46.6333
          },
          destination: {
            address: 'Rua Oscar Freire, 200',
            district: 'Jardins',
            latitude: -23.5618,
            longitude: -46.6565
          },
          value: 32.00,
          distance: 1200,
          estimatedTime: 25,
          description: 'Entrega de comida quente',
          customer: {
            name: 'João Santos',
            phone: '+55 11 98888-8888'
          },
          items: [
            { name: 'Pizza margherita', quantity: 1 },
            { name: 'Refrigerante 2L', quantity: 1 }
          ],
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      return response.json({
        status: 'success',
        deliveries: mockDeliveries,
        pagination: {
          page: 1,
          perPage: 10,
          total: mockDeliveries.length,
          totalPages: 1
        }
      })
    } catch (error) {
      console.error('Erro ao obter entregas disponíveis:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Obter detalhes de uma entrega específica
  async getById({ auth, params, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params

      // Dados mockados para diferentes entregas
      const mockDeliveries = {
        '1': {
          id: '1',
          origin: {
            address: 'Rua das Flores, 123',
            district: 'Centro',
            latitude: -23.5505,
            longitude: -46.6333
          },
          destination: {
            address: 'Av. Paulista, 1000',
            district: 'Bela Vista',
            latitude: -23.5618,
            longitude: -46.6565
          },
          value: 25.50,
          distance: 2800,
          estimatedTime: 45,
          description: 'Entrega de documentos importantes',
          customer: {
            name: 'Maria Silva',
            phone: '+55 11 99999-9999'
          },
          items: [
            { name: 'Documentos', quantity: 1 },
            { name: 'Envelope lacrado', quantity: 1 }
          ],
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        '2': {
          id: '2',
          origin: {
            address: 'Rua Augusta, 500',
            district: 'Consolação',
            latitude: -23.5505,
            longitude: -46.6333
          },
          destination: {
            address: 'Rua Oscar Freire, 200',
            district: 'Jardins',
            latitude: -23.5618,
            longitude: -46.6565
          },
          value: 32.00,
          distance: 1200,
          estimatedTime: 25,
          description: 'Entrega de comida quente',
          customer: {
            name: 'João Santos',
            phone: '+55 11 98888-8888'
          },
          items: [
            { name: 'Pizza margherita', quantity: 1 },
            { name: 'Refrigerante 2L', quantity: 1 }
          ],
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      // Buscar a entrega pelo ID
      const delivery = mockDeliveries[id]

      if (!delivery) {
        return response.status(404).json({
          status: 'error',
          message: 'Entrega não encontrada'
        })
      }

      return response.json({
        status: 'success',
        delivery
      })
    } catch (error) {
      console.error('Erro ao obter detalhes da entrega:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Aceitar uma entrega
  async accept({ auth, params, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params

      // Simular aceitação de entrega (implementar modelo real depois)
      return response.json({
        status: 'success',
        message: 'Entrega aceita com sucesso',
        deliveryId: id,
        driverId: user.id
      })
    } catch (error) {
      console.error('Erro ao aceitar entrega:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Rejeitar uma entrega
  async reject({ auth, params, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params

      // Simular rejeição de entrega (implementar modelo real depois)
      return response.json({
        status: 'success',
        message: 'Entrega rejeitada com sucesso',
        deliveryId: id,
        driverId: user.id
      })
    } catch (error) {
      console.error('Erro ao rejeitar entrega:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Atualizar status da entrega
  async updateStatus({ auth, params, request, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params
      const data = request.only(['status', 'latitude', 'longitude', 'photo', 'notes'])

      // Simular atualização de status (implementar modelo real depois)
      return response.json({
        status: 'success',
        message: 'Status atualizado com sucesso',
        deliveryId: id,
        newStatus: data.status
      })
    } catch (error) {
      console.error('Erro ao atualizar status da entrega:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Obter histórico de entregas
  async getHistory({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)

      // Simular histórico de entregas (implementar modelo real depois)
      const mockHistory = [
        {
          id: '1',
          origin: {
            address: 'Rua das Flores, 123',
            district: 'Centro'
          },
          destination: {
            address: 'Av. Paulista, 1000',
            district: 'Bela Vista'
          },
          value: 25.50,
          status: 'completed',
          completedAt: new Date().toISOString(),
          rating: 5
        }
      ]

      return response.json({
        status: 'success',
        deliveries: mockHistory,
        pagination: {
          page: 1,
          perPage: 10,
          total: mockHistory.length,
          totalPages: 1
        }
      })
    } catch (error) {
      console.error('Erro ao obter histórico de entregas:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Obter resumo de entregas
  async getSummary({ auth, response }) {
    try {
      const user = await auth.getUser()

      // Simular resumo (implementar modelo real depois)
      const summary = {
        totalDeliveries: 15,
        completedDeliveries: 12,
        cancelledDeliveries: 2,
        pendingDeliveries: 1,
        totalEarnings: 450.50,
        averageRating: 4.8
      }

      return response.json({
        status: 'success',
        summary
      })
    } catch (error) {
      console.error('Erro ao obter resumo de entregas:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Obter entregas ativas
  async getActive({ auth, response }) {
    try {
      const user = await auth.getUser()

      // Simular entregas ativas (implementar modelo real depois)
      const activeDeliveries = [
        {
          id: '1',
          origin: {
            address: 'Rua das Flores, 123',
            district: 'Centro'
          },
          destination: {
            address: 'Av. Paulista, 1000',
            district: 'Bela Vista'
          },
          value: 25.50,
          status: 'in_progress',
          acceptedAt: new Date().toISOString()
        }
      ]

      return response.json({
        status: 'success',
        deliveries: activeDeliveries
      })
    } catch (error) {
      console.error('Erro ao obter entregas ativas:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Obter estatísticas do motorista
  async getDriverStats({ auth, response }) {
    try {
      const user = await auth.getUser()

      // Simular estatísticas do motorista (implementar modelo real depois)
      const stats = {
        totalDeliveries: 25,
        completedDeliveries: 22,
        cancelledDeliveries: 2,
        totalEarnings: 750.00,
        averageRating: 4.7,
        successRate: 88.0,
        weeklyEarnings: 150.00,
        monthlyEarnings: 600.00
      }

      return response.json({
        status: 'success',
        stats
      })
    } catch (error) {
      console.error('Erro ao obter estatísticas do motorista:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }
}

module.exports = DeliveryController