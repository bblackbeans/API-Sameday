'use strict'

const EmailService = use('App/Services/EmailService')

class EmailController {
  /**
   * Test email configuration
   */
  async testEmail({ response }) {
    try {
      const result = await EmailService.testConnection()
      
      if (result.success) {
        return response.json({
          success: true,
          message: 'Email configuration is working!',
          details: result
        })
      } else {
        return response.status(500).json({
          success: false,
          message: 'Email configuration failed',
          error: result.error
        })
      }
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error testing email configuration',
        error: error.message
      })
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail({ request, response }) {
    try {
      const { to, subject, message } = request.only(['to', 'subject', 'message'])

      if (!to) {
        return response.status(400).json({
          success: false,
          message: 'Email address is required'
        })
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SameDay - Teste de Email</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Email de Teste</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Este é um email de teste do sistema SameDay.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #333; font-weight: bold;">Mensagem:</p>
              <p style="margin: 10px 0 0 0; color: #666;">${message || 'Nenhuma mensagem específica fornecida.'}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 20px;">
              Se você recebeu este email, o serviço de email está funcionando corretamente!
            </p>
          </div>
          
          <div style="background: #333; padding: 15px; text-align: center; color: white;">
            <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
          </div>
        </div>
      `

      const result = await EmailService.sendEmail({
        to,
        subject: subject || '[SameDay] Teste de Email',
        html
      })

      if (result.success) {
        return response.json({
          success: true,
          message: 'Test email sent successfully!',
          messageId: result.messageId
        })
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to send test email',
          error: result.error
        })
      }
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error sending test email',
        error: error.message
      })
    }
  }

  /**
   * Send custom email
   */
  async sendCustomEmail({ request, response }) {
    try {
      const { to, subject, html, text } = request.only(['to', 'subject', 'html', 'text'])

      if (!to || !subject) {
        return response.status(400).json({
          success: false,
          message: 'Email address and subject are required'
        })
      }

      const result = await EmailService.sendEmail({
        to,
        subject,
        html,
        text
      })

      if (result.success) {
        return response.json({
          success: true,
          message: 'Email sent successfully!',
          messageId: result.messageId
        })
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to send email',
          error: result.error
        })
      }
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error sending email',
        error: error.message
      })
    }
  }
}

module.exports = EmailController
