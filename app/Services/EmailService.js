'use strict'

const nodemailer = require('nodemailer')
const Logger = use('Logger')

class EmailService {
  constructor() {
    this.transporter = null
    this.initializeTransporter()
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // Verificar se as variáveis de ambiente estão definidas
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        Logger.warning('Email service not initialized: Missing SMTP configuration')
        return
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      Logger.info('Email service initialized successfully')
    } catch (error) {
      Logger.error('Error initializing email service:', error)
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   * @param {string} options.from - Sender email (optional)
   * @returns {Object} - Result object
   */
  async sendEmail({ to, subject, html, text, from = null }) {
    try {
      // Se o transporter não foi inicializado, tentar inicializar novamente
      if (!this.transporter) {
        this.initializeTransporter()
        if (!this.transporter) {
          throw new Error('Email transporter not initialized - check SMTP configuration')
        }
      }

      const mailOptions = {
        from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      Logger.info(`Email sent successfully to ${to}: ${info.messageId}`)
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      }
    } catch (error) {
      Logger.error('Error sending email:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      }
    }
  }

  /**
   * Send contact form email
   * @param {Object} contactData - Contact form data
   * @returns {Object} - Result object
   */
  async sendContactForm(contactData) {
    const { name, email, phone, subject, message, userType } = contactData

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay - Novo Contato</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Detalhes do Contato</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Nome:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Telefone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tipo:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${userType || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Assunto:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Mensagem:</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `[SameDay] Novo contato: ${subject}`,
      html
    })
  }

  /**
   * Send shipper registration email
   * @param {Object} shipperData - Shipper registration data
   * @returns {Object} - Result object
   */
  async sendShipperRegistration(shipperData) {
    const { companyName, cnpj, contactName, email, phone, address, businessType, monthlyVolume, description } = shipperData

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay - Novo Embarcador</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Dados da Empresa</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Empresa:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">CNPJ:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${cnpj}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Contato:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${contactName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Telefone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Endereço:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tipo de Negócio:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${businessType || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Volume Mensal:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${monthlyVolume || 'Não informado'}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Descrição:</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
            ${description ? description.replace(/\n/g, '<br>') : 'Não informado'}
          </div>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `[SameDay] Novo embarcador: ${companyName}`,
      html
    })
  }

  /**
   * Send carrier registration email
   * @param {Object} carrierData - Carrier registration data
   * @returns {Object} - Result object
   */
  async sendCarrierRegistration(carrierData) {
    const { companyName, cnpj, contactName, email, phone, address, rntrc, fleetSize, vehicleTypes, operationAreas } = carrierData

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay - Novo Transportador</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Dados da Empresa</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Empresa:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">CNPJ:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${cnpj}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Contato:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${contactName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Telefone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">RNTRC:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${rntrc}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tamanho da Frota:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${fleetSize || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tipos de Veículos:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${vehicleTypes || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Áreas de Operação:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${operationAreas || 'Não informado'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `[SameDay] Novo transportador: ${companyName}`,
      html
    })
  }

  /**
   * Send stock store registration email
   * @param {Object} stockData - Stock store registration data
   * @returns {Object} - Result object
   */
  async sendStockStoreRegistration(stockData) {
    const { ownerName, email, phone, cpfCnpj, propertyType, address, spaceSize, availability } = stockData

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay - Novo Parceiro Stock Store</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Dados do Parceiro</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Nome:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Telefone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">CPF/CNPJ:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${cpfCnpj}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tipo de Propriedade:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${propertyType || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Endereço:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tamanho do Espaço:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${spaceSize || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Disponibilidade:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${availability || 'Não informado'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `[SameDay] Novo parceiro stock store: ${ownerName}`,
      html
    })
  }

  /**
   * Send confirmation email to user
   * @param {string} userEmail - User email
   * @param {string} userName - User name
   * @param {string} formType - Type of form submitted
   * @returns {Object} - Result object
   */
  async sendConfirmationEmail(userEmail, userName, formType) {
    const formNames = {
      'contact': 'contato',
      'shipper': 'cadastro de embarcador',
      'carrier': 'cadastro de transportador',
      'stock-store': 'cadastro de parceiro stock store'
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay</h1>
          <p style="color: white; margin: 5px 0 0 0;">Sua entrega no mesmo dia</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Recebemos seu ${formNames[formType] || 'formulário'} com sucesso!
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Nossa equipe entrará em contato em breve para dar continuidade ao seu processo.
          </p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0; color: #333; font-weight: bold;">Próximos passos:</p>
            <ul style="margin: 10px 0 0 0; color: #666;">
              <li>Análise dos dados enviados</li>
              <li>Contato da nossa equipe comercial</li>
              <li>Apresentação da proposta</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Obrigado por escolher a SameDay!
          </p>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: `[SameDay] Confirmação de ${formNames[formType] || 'formulário'}`,
      html
    })
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetToken - Reset token
   * @param {string} userName - User name
   * @returns {Object} - Result object
   */
  async sendPasswordReset(email, resetToken, userName = 'Usuário') {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3004'}/reset-password?token=${resetToken}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay</h1>
          <p style="color: white; margin: 5px 0 0 0;">Redefinição de Senha</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Recebemos uma solicitação para redefinir sua senha na SameDay.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Clique no botão abaixo para criar uma nova senha:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Se você não solicitou esta redefinição, ignore este email.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Este link expira em 24 horas por motivos de segurança.
          </p>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: '[SameDay] Redefinição de Senha',
      html
    })
  }

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} - Plain text
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  /**
   * Test email configuration
   * @returns {Object} - Test result
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      await this.transporter.verify()
      return { success: true, message: 'Email configuration is valid' }
    } catch (error) {
      Logger.error('Email configuration test failed:', error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new EmailService()
