'use strict'

const Contact = use('App/Models/Base/Contacts')
const Database = use('Database')
const EmailService = use('App/Services/EmailService')

class ContactController {
  /**
   * Criar novo contato
   */
  async postContact({ request, response }) {
    try {
      const data = request.only([
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'userType'
      ])

      // Validação básica
      const requiredFields = ['name', 'email', 'subject', 'message']
      for (const field of requiredFields) {
        if (!data[field]) {
          return response.status(400).json({
            error: `Campo ${field} é obrigatório`
          })
        }
      }

      // Criar novo contato
      const contact = await Contact.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        user_type: data.userType
      })

      // Enviar email de notificação para a equipe
      try {
        await EmailService.sendContactForm({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          userType: data.userType
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
        // Não falha o processo se o email não enviar
      }

      // Enviar email de confirmação para o usuário
      try {
        await EmailService.sendConfirmationEmail(data.email, data.name, 'contact')
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmação:', emailError)
        // Não falha o processo se o email não enviar
      }

      return response.status(201).json({
        message: 'Mensagem enviada com sucesso!',
        contact: contact.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Listar contatos
   */
  async getContacts({ request, response }) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const status = request.input('status')
      const userType = request.input('user_type')

      let query = Contact.query()

      if (status) {
        query = query.where('status', status)
      }

      if (userType) {
        query = query.where('user_type', userType)
      }

      const contacts = await query
        .orderBy('created_at', 'desc')
        .paginate(page, perPage)

      return response.json({
        contacts: contacts.toJSON().data,
        total: contacts.toJSON().total,
        pages: contacts.toJSON().lastPage,
        current_page: page
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Obter contato específico
   */
  async getContact({ params, response }) {
    try {
      const contact = await Contact.findOrFail(params.id)
      return response.json(contact.toJSON())

    } catch (error) {
      return response.status(404).json({
        error: 'Contato não encontrado'
      })
    }
  }

  /**
   * Atualizar status do contato
   */
  async putContactStatus({ params, request, response }) {
    try {
      const { status } = request.only(['status'])

      if (!['new', 'in_progress', 'resolved'].includes(status)) {
        return response.status(400).json({
          error: 'Status inválido'
        })
      }

      const contact = await Contact.findOrFail(params.id)
      contact.status = status
      await contact.save()

      return response.json({
        message: 'Status atualizado com sucesso!',
        contact: contact.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Atualizar contato
   */
  async putContact({ params, request, response }) {
    try {
      const data = request.only([
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'userType'
      ])

      const contact = await Contact.findOrFail(params.id)

      // Atualizar campos
      if (data.name) contact.name = data.name
      if (data.email) contact.email = data.email
      if (data.phone) contact.phone = data.phone
      if (data.subject) contact.subject = data.subject
      if (data.message) contact.message = data.message
      if (data.userType) contact.user_type = data.userType

      await contact.save()

      return response.json({
        message: 'Contato atualizado com sucesso!',
        contact: contact.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Deletar contato
   */
  async deleteContact({ params, response }) {
    try {
      const contact = await Contact.findOrFail(params.id)
      await contact.delete()

      return response.status(204).send()

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = ContactController
