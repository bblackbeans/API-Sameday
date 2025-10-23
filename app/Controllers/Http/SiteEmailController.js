'use strict'

const EmailService = use('App/Services/EmailService')

class SiteEmailController {
  /**
   * Endpoint para receber dados do site
   * POST /api/send-email
   */
  async sendEmail({ request, response }) {
    try {
      const { formType, formData, timestamp } = request.all()

      // Validar dados obrigatórios
      if (!formType || !formData) {
        return response.status(400).json({
          success: false,
          message: 'formType e formData são obrigatórios'
        })
      }

      // Determinar assunto baseado no tipo
      const subjects = {
        'contact': 'Contato - SameDay',
        'embarcador': 'Cadastro Embarcador - SameDay',
        'transportador': 'Cadastro Transportador - SameDay',
        'stock-store': 'Interesse Stock Store - SameDay',
        'entregador': 'Cadastro Entregador - SameDay'
      }

      const subject = subjects[formType] || 'Contato - SameDay'

      // Criar HTML do email
      const html = this.createEmailHTML(formType, formData, timestamp)

      // Enviar email para a equipe
      const emailResult = await EmailService.sendEmail({
        to: process.env.CONTACT_EMAIL || 'kaue.ronald@blackbeans.com.br',
        subject: subject,
        html: html
      })

      if (!emailResult.success) {
        throw new Error(emailResult.error)
      }

      // Enviar confirmação para o usuário (se tiver email)
      if (formData.email) {
        try {
          await EmailService.sendConfirmationEmail(
            formData.email, 
            formData.name || formData.contactName || formData.ownerName || formData.fullName || 'Usuário',
            formType
          )
        } catch (confirmationError) {
          console.error('Erro ao enviar confirmação:', confirmationError)
          // Não falha o processo se a confirmação não enviar
        }
      }

      return response.json({
        success: true,
        message: 'Email enviado com sucesso!',
        messageId: emailResult.messageId
      })

    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro ao enviar email: ' + error.message
      })
    }
  }

  /**
   * Criar HTML do email
   */
  createEmailHTML(formType, formData, timestamp) {
    const formNames = {
      'contact': 'Contato',
      'embarcador': 'Embarcador',
      'transportador': 'Transportador',
      'stock-store': 'Stock Store',
      'entregador': 'Entregador'
    }

    const formName = formNames[formType] || 'Contato'
    const dateTime = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')

    // Criar tabela com os dados
    let tableRows = ''
    for (const [key, value] of Object.entries(formData)) {
      if (value && value !== '' && value !== null && value !== undefined) {
        const fieldName = this.formatFieldName(key)
        tableRows += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">${fieldName}:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${value}</td>
          </tr>
        `
      }
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SameDay Logística</h1>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Novo ${formName}</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Detalhes do ${formName}</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            ${tableRows}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Data/Hora:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${dateTime}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center; color: white;">
          <p style="margin: 0;">SameDay - Sua entrega no mesmo dia</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Este email foi enviado automaticamente pelo sistema</p>
        </div>
      </div>
    `
  }

  /**
   * Formatar nome do campo
   */
  formatFieldName(fieldName) {
    const fieldNames = {
      'name': 'Nome',
      'fullName': 'Nome Completo',
      'contactName': 'Nome do Contato',
      'ownerName': 'Nome do Proprietário',
      'email': 'Email',
      'phone': 'Telefone',
      'subject': 'Assunto',
      'message': 'Mensagem',
      'userType': 'Tipo de Usuário',
      'companyName': 'Nome da Empresa',
      'cnpj': 'CNPJ',
      'cpf': 'CPF',
      'cpfCnpj': 'CPF/CNPJ',
      'address': 'Endereço',
      'businessType': 'Tipo de Negócio',
      'monthlyVolume': 'Volume Mensal',
      'description': 'Descrição',
      'agreeTerms': 'Concorda com Termos',
      'fleetSize': 'Tamanho da Frota',
      'vehicleTypes': 'Tipos de Veículos',
      'operationAreas': 'Áreas de Operação',
      'rntrc': 'RNTRC',
      'experience': 'Experiência',
      'vehicleType': 'Tipo de Veículo',
      'cnh': 'CNH',
      'propertyType': 'Tipo de Propriedade',
      'spaceSize': 'Tamanho do Espaço',
      'availability': 'Disponibilidade'
    }

    return fieldNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  }

  /**
   * Testar endpoint
   */
  async testEndpoint({ response }) {
    // Verificar configurações de email
    const emailConfig = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER ? '***' : 'NOT_SET',
      SMTP_PASS: process.env.SMTP_PASS ? '***' : 'NOT_SET',
      SMTP_FROM: process.env.SMTP_FROM,
      CONTACT_EMAIL: process.env.CONTACT_EMAIL
    }

    // Testar conexão com email
    let emailTest = null
    try {
      emailTest = await EmailService.testConnection()
    } catch (error) {
      emailTest = { success: false, error: error.message }
    }

    return response.json({
      success: true,
      message: 'Endpoint funcionando!',
      timestamp: new Date().toISOString(),
      availableFormTypes: ['contact', 'embarcador', 'transportador', 'stock-store', 'entregador'],
      emailConfig,
      emailTest
    })
  }
}

module.exports = SiteEmailController
