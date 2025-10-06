'use strict'



class NotificationController {
  // Obter notificações do entregador
  async getNotifications({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const unreadOnly = request.input('unread_only', false)

      // Simular notificações (implementar modelo real depois)
      const mockNotifications = [
        {
          id: '1',
          title: 'Nova entrega disponível',
          message: 'Você tem uma nova entrega disponível na sua região',
          type: 'delivery',
          priority: 'high',
          read: false,
          data: {
            deliveryId: '1',
            value: 25.50,
            distance: 2800
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Pagamento processado',
          message: 'Seu pagamento da semana passada foi processado',
          type: 'payment',
          priority: 'medium',
          read: true,
          data: {
            amount: 1250.50,
            method: 'pix'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: 'Documento aprovado',
          message: 'Sua CNH foi aprovada e você já pode aceitar entregas',
          type: 'document',
          priority: 'high',
          read: false,
          data: {
            documentType: 'cnh',
            status: 'approved'
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '4',
          title: 'Lembrete de manutenção',
          message: 'Lembre-se de fazer a manutenção preventiva do seu veículo',
          type: 'reminder',
          priority: 'low',
          read: true,
          data: {
            reminderType: 'vehicle_maintenance',
            dueDate: '2024-03-15'
          },
          createdAt: new Date(Date.now() - 259200000).toISOString()
      ]

      let filteredNotifications = mockNotifications

      if (unreadOnly) {
        filteredNotifications = mockNotifications.filter(n => !n.read)

      return response.json({
        status: 'success',
        notifications: filteredNotifications,
        total: filteredNotifications.length,
        unreadCount: mockNotifications.filter(n => !n.read).length,
        page,
        perPage
      })
    } catch (error) {
      console.error('Erro ao obter notificações:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

  // Marcar notificação como lida
  async markAsRead({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const { id } = params

      // Simular marcação como lida (implementar modelo real depois)
      return response.json({
        status: 'success',
        message: 'Notificação marcada como lida!',
        notification: {
          id: id,
          read: true,
          readAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

  // Obter configurações de notificação
  async getSettings({ auth, response }) {
    try {
      const user = await auth.getUser()

      // Simular configurações de notificação (implementar modelo real depois)
      const settings = {
        pushNotifications: {
          enabled: true,
          deliveryAlerts: true,
          paymentAlerts: true,
          documentAlerts: true,
          reminderAlerts: true
        },
        emailNotifications: {
          enabled: true,
          weeklySummary: true,
          paymentReceipts: true,
          importantUpdates: true
        },
        smsNotifications: {
          enabled: false,
          urgentAlerts: true,
          paymentAlerts: false
        },
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '07:00',
          timezone: 'America/Sao_Paulo'
        },
        notificationTypes: [
          {
            id: 'delivery',
            name: 'Entregas',
            description: 'Notificações sobre novas entregas disponíveis',
            enabled: true,
            channels: ['push', 'email']
          },
          {
            id: 'payment',
            name: 'Pagamentos',
            description: 'Notificações sobre pagamentos e saques',
            enabled: true,
            channels: ['push', 'email', 'sms']
          },
          {
            id: 'document',
            name: 'Documentos',
            description: 'Notificações sobre status dos documentos',
            enabled: true,
            channels: ['push', 'email']
          },
          {
            id: 'reminder',
            name: 'Lembretes',
            description: 'Lembretes e notificações importantes',
            enabled: true,
            channels: ['push']
          },
          {
            id: 'promotion',
            name: 'Promoções',
            description: 'Ofertas especiais e promoções',
            enabled: false,
            channels: ['push', 'email']
        ]

      return response.json({
        status: 'success',
        settings
      })
    } catch (error) {
      console.error('Erro ao obter configurações de notificação:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

module.exports = NotificationController




