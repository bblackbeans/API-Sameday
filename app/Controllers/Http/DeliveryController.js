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

      const Database = use('Database')

      // Atualizar entrega no banco
      await Database
        .table('orders')
        .where('id', id)
        .update({
          idDriver: user.id,
          status: 'execution',
          updated_at: new Date().toISOString()
        })

      console.log(`✅ Entrega ${id} aceita pelo entregador ${user.id}`)

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

      const Database = use('Database')
      
      // Mapear status do app para status do banco
      const statusMap = {
        'accepted': 'execution',
        'going_to_pickup': 'execution',
        'at_pickup': 'execution',
        'picked_up': 'execution',
        'going_to_delivery': 'execution',
        'at_delivery': 'execution',
        'completed': 'finished'
      }

      const dbStatus = statusMap[data.status] || 'execution'

      // Atualizar status no banco
      await Database
        .table('orders')
        .where('id', id)
        .where('idDriver', user.id)
        .update({
          status: dbStatus,
          updated_at: new Date().toISOString()
        })

      // Salvar localização se fornecida
      if (data.latitude && data.longitude) {
        await Database
          .table('order_delivery')
          .insert({
            idOrder: id,
            idDriver: user.id,
            deliveryStatus: data.status,
            eventDate: new Date().toISOString(),
            latitude: data.latitude,
            longitude: data.longitude,
            success: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      console.log(`✅ Status atualizado no banco: ${data.status} → ${dbStatus}`)

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
      const period = request.input('period', 'week') // week, month, all
      
      // Calcular datas baseado no período
      let startDate = new Date()
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        startDate = new Date(0) // Desde o início
      }

      // Buscar entregas do entregador no banco
      const Database = use('Database')
      const deliveries = await Database
        .table('orders')
        .where('idDriver', user.id)
        .where('status', 'finished')
        .where('created_at', '>=', startDate.toISOString())
        .orderBy('created_at', 'desc')
        .select('id', 'km', 'price', 'status', 'created_at', 'updated_at')

      // Buscar informações de origem e destino
      const deliveriesWithDetails = await Promise.all(
        deliveries.map(async (delivery) => {
          const orderInfo = await Database
            .table('order_information')
            .where('idOrder', delivery.id)
            .first()

          const items = await Database
            .table('items')
            .where('idOrder', delivery.id)
            .select('name', 'quantity', 'description')

          return {
            id: delivery.id.toString(),
            origin: {
              address: orderInfo?.withdraw || 'Endereço não disponível',
              district: 'N/A'
            },
            destination: {
              address: orderInfo?.destiny || 'Endereço não disponível',
              district: 'N/A'
            },
            value: parseFloat(delivery.price) || 0,
            distance: parseFloat(delivery.km) || 0,
            status: 'completed',
            completedAt: delivery.updated_at,
            items: items || []
          }
        })
      )

      return response.json({
        status: 'success',
        deliveries: deliveriesWithDetails,
        pagination: {
          page: 1,
          perPage: deliveriesWithDetails.length,
          total: deliveriesWithDetails.length,
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
  async getSummary({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const period = request.input('period', 'week')

      // Calcular datas baseado no período
      let startDate = new Date()
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        startDate = new Date(0)
      }

      // Buscar dados reais do banco
      const Database = use('Database')
      
      const allDeliveries = await Database
        .table('orders')
        .where('idDriver', user.id)
        .where('created_at', '>=', startDate.toISOString())

      const completedDeliveries = allDeliveries.filter(d => d.status === 'finished')
      const cancelledDeliveries = allDeliveries.filter(d => d.status === 'cancelled')
      const pendingDeliveries = allDeliveries.filter(d => d.status === 'pending')

      // Calcular ganhos totais
      const totalEarnings = completedDeliveries.reduce((sum, delivery) => {
        return sum + (parseFloat(delivery.price) || 0)
      }, 0)

      // Calcular distância total
      const totalDistance = completedDeliveries.reduce((sum, delivery) => {
        return sum + (parseFloat(delivery.km) || 0)
      }, 0)

      const summary = {
        totalDeliveries: allDeliveries.length,
        completedDeliveries: completedDeliveries.length,
        cancelledDeliveries: cancelledDeliveries.length,
        pendingDeliveries: pendingDeliveries.length,
        totalEarnings: totalEarnings,
        totalDistance: totalDistance,
        averageRating: 0 // Implementar depois
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

  // Upload foto de coleta
  async uploadPickupPhoto({ auth, params, request, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params
      
      const photo = request.file('photo', {
        types: ['image'],
        size: '10mb'
      })

      if (!photo) {
        return response.status(400).json({
          status: 'error',
          message: 'Foto não fornecida'
        })
      }

      // Salvar foto (usando Cloudinary ou storage local)
      const Helpers = use('Helpers')
      const fileName = `${Date.now()}-pickup-${id}.${photo.extname}`
      await photo.move(Helpers.publicPath('uploads/pickup'), {
        name: fileName,
        overwrite: true
      })

      if (!photo.moved()) {
        return response.status(500).json({
          status: 'error',
          message: 'Erro ao salvar foto'
        })
      }

      const Database = use('Database')
      
      // Salvar referência da foto no banco
      await Database
        .table('order_delivery')
        .insert({
          idOrder: id,
          idDriver: user.id,
          deliveryStatus: 'picked_up',
          pickupPhoto: `/uploads/pickup/${fileName}`,
          eventDate: new Date().toISOString(),
          success: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      console.log(`📸 Foto de coleta salva: ${fileName}`)

      return response.json({
        status: 'success',
        message: 'Foto de coleta enviada com sucesso',
        photoUrl: `/uploads/pickup/${fileName}`
      })
    } catch (error) {
      console.error('Erro ao fazer upload da foto de coleta:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  // Upload foto de entrega
  async uploadDeliveryPhoto({ auth, params, request, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params
      
      const photo = request.file('photo', {
        types: ['image'],
        size: '10mb'
      })

      if (!photo) {
        return response.status(400).json({
          status: 'error',
          message: 'Foto não fornecida'
        })
      }

      // Salvar foto
      const Helpers = use('Helpers')
      const fileName = `${Date.now()}-delivery-${id}.${photo.extname}`
      await photo.move(Helpers.publicPath('uploads/delivery'), {
        name: fileName,
        overwrite: true
      })

      if (!photo.moved()) {
        return response.status(500).json({
          status: 'error',
          message: 'Erro ao salvar foto'
        })
      }

      const Database = use('Database')
      
      // Salvar referência da foto no banco
      await Database
        .table('order_delivery')
        .insert({
          idOrder: id,
          idDriver: user.id,
          deliveryStatus: 'delivered',
          deliveryPhoto: `/uploads/delivery/${fileName}`,
          eventDate: new Date().toISOString(),
          success: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      console.log(`📸 Foto de entrega salva: ${fileName}`)

      return response.json({
        status: 'success',
        message: 'Foto de entrega enviada com sucesso',
        photoUrl: `/uploads/delivery/${fileName}`
      })
    } catch (error) {
      console.error('Erro ao fazer upload da foto de entrega:', error)
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