'use strict'



class PaymentController {
  // Obter pagamentos do entregador
  async getPayments({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const period = request.input('period', 'month')

      // Simular pagamentos (implementar modelo real depois)
      const mockPayments = [
        {
          id: '1',
          amount: 1250.50,
          period: '2024-01',
          status: 'paid',
          paidAt: '2024-02-05T10:00:00Z',
          method: 'pix',
          description: 'Pagamento semanal - 22 a 28 de janeiro',
          deliveries: 45,
          totalDistance: 125.5
        },
        {
          id: '2',
          amount: 1180.75,
          period: '2024-01',
          status: 'paid',
          paidAt: '2024-01-29T10:00:00Z',
          method: 'pix',
          description: 'Pagamento semanal - 15 a 21 de janeiro',
          deliveries: 42,
          totalDistance: 118.2
        },
        {
          id: '3',
          amount: 1350.25,
          period: '2024-01',
          status: 'pending',
          paidAt: null,
          method: 'pix',
          description: 'Pagamento semanal - 29 de janeiro a 4 de fevereiro',
          deliveries: 48,
          totalDistance: 142.8
      ]

      return response.json({
        status: 'success',
        payments: mockPayments,
        total: mockPayments.length,
        page,
        perPage
      })
    } catch (error) {
      console.error('Erro ao obter pagamentos:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

  // Obter resumo de pagamentos
  async getSummary({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const period = request.input('period', 'month')

      // Simular resumo de pagamentos (implementar modelo real depois)
      const summary = {
        totalEarnings: 3247.85,
        paidAmount: 2430.25,
        pendingAmount: 817.60,
        thisMonth: {
          earnings: 1250.50,
          deliveries: 45,
          averagePerDelivery: 27.79
        },
        lastMonth: {
          earnings: 1180.75,
          deliveries: 42,
          averagePerDelivery: 28.11
        },
        paymentMethods: [
          {
            type: 'pix',
            name: 'PIX',
            available: true,
            fee: 0
          },
          {
            type: 'bank_transfer',
            name: 'Transferência Bancária',
            available: true,
            fee: 2.50
        ]

      return response.json({
        status: 'success',
        summary
      })
    } catch (error) {
      console.error('Erro ao obter resumo de pagamentos:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

  // Obter métodos de pagamento disponíveis
  async getMethods({ auth, response }) {
    try {
      const user = await auth.getUser()

      // Simular métodos de pagamento (implementar modelo real depois)
      const methods = [
        {
          id: 'pix',
          name: 'PIX',
          description: 'Transferência instantânea via PIX',
          available: true,
          fee: 0,
          processingTime: 'Imediato',
          minAmount: 10.00,
          maxAmount: 5000.00
        },
        {
          id: 'bank_transfer',
          name: 'Transferência Bancária',
          description: 'Transferência para conta bancária',
          available: true,
          fee: 2.50,
          processingTime: '1-2 dias úteis',
          minAmount: 50.00,
          maxAmount: 10000.00
        },
        {
          id: 'digital_wallet',
          name: 'Carteira Digital',
          description: 'Saldo na carteira digital do app',
          available: false,
          fee: 0,
          processingTime: 'Imediato',
          minAmount: 5.00,
          maxAmount: 1000.00
      ]

      return response.json({
        status: 'success',
        methods
      })
    } catch (error) {
      console.error('Erro ao obter métodos de pagamento:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

  // Solicitar saque
  async requestWithdrawal({ auth, request, response }) {
    try {
      const user = await auth.getUser()



      const { amount, method, accountDetails } = request.only(['amount', 'method', 'accountDetails'])

      // Verificar se o usuário tem saldo suficiente
      const availableBalance = 817.60 // Simular saldo disponível
      if (amount > availableBalance) {
        return response.status(400).json({
          status: 'error',
          message: 'Saldo insuficiente para o saque'
        })

      // Simular solicitação de saque (implementar modelo real depois)
      const withdrawal = {
        id: 'withdrawal_' + Date.now(),
        driverId: user.id,
        amount: amount,
        method: method,
        accountDetails: accountDetails,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        estimatedProcessingTime: method === 'pix' ? 'Imediato' : '1-2 dias úteis',
        fee: method === 'pix' ? 0 : 2.50,
        netAmount: amount - (method === 'pix' ? 0 : 2.50)

      return response.json({
        status: 'success',
        message: 'Solicitação de saque enviada com sucesso!',
        withdrawal
      })
    } catch (error) {
      console.error('Erro ao solicitar saque:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })

module.exports = PaymentController




