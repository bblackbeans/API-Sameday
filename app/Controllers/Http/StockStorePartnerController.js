'use strict'

const StockStorePartner = use('App/Models/Base/StockStorePartners')
const Database = use('Database')

class StockStorePartnerController {
  /**
   * Criar novo parceiro Stock Store
   */
  async postStockStorePartner({ request, response }) {
    try {
      const data = request.only([
        'ownerName',
        'email',
        'phone',
        'cpfCnpj',
        'propertyType',
        'address',
        'spaceSize',
        'availability',
        'experience',
        'description'
      ])

      // Validação básica
      const requiredFields = ['ownerName', 'email', 'phone', 'cpfCnpj', 'propertyType', 'address']
      for (const field of requiredFields) {
        if (!data[field]) {
          return response.status(400).json({
            error: `Campo ${field} é obrigatório`
          })
        }
      }

      // Criar novo parceiro Stock Store
      const partner = await StockStorePartner.create({
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        cpf_cnpj: data.cpfCnpj,
        property_type: data.propertyType,
        address: data.address,
        space_size: data.spaceSize,
        availability: data.availability,
        experience: data.experience,
        description: data.description
      })

      return response.status(201).json({
        message: 'Interesse enviado com sucesso!',
        partner: partner.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Listar parceiros Stock Store
   */
  async getStockStorePartners({ request, response }) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const status = request.input('status')

      let query = StockStorePartner.query()

      if (status) {
        query = query.where('status', status)
      }

      const partners = await query
        .orderBy('created_at', 'desc')
        .paginate(page, perPage)

      return response.json({
        partners: partners.toJSON().data,
        total: partners.toJSON().total,
        pages: partners.toJSON().lastPage,
        current_page: page
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Obter parceiro Stock Store específico
   */
  async getStockStorePartner({ params, response }) {
    try {
      const partner = await StockStorePartner.findOrFail(params.id)
      return response.json(partner.toJSON())

    } catch (error) {
      return response.status(404).json({
        error: 'Parceiro não encontrado'
      })
    }
  }

  /**
   * Atualizar status do parceiro Stock Store
   */
  async putStockStorePartnerStatus({ params, request, response }) {
    try {
      const { status } = request.only(['status'])

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return response.status(400).json({
          error: 'Status inválido'
        })
      }

      const partner = await StockStorePartner.findOrFail(params.id)
      partner.status = status
      await partner.save()

      return response.json({
        message: 'Status atualizado com sucesso!',
        partner: partner.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Atualizar parceiro Stock Store
   */
  async putStockStorePartner({ params, request, response }) {
    try {
      const data = request.only([
        'ownerName',
        'email',
        'phone',
        'propertyType',
        'address',
        'spaceSize',
        'availability',
        'experience',
        'description'
      ])

      const partner = await StockStorePartner.findOrFail(params.id)

      // Atualizar campos
      if (data.ownerName) partner.owner_name = data.ownerName
      if (data.email) partner.email = data.email
      if (data.phone) partner.phone = data.phone
      if (data.propertyType) partner.property_type = data.propertyType
      if (data.address) partner.address = data.address
      if (data.spaceSize) partner.space_size = data.spaceSize
      if (data.availability) partner.availability = data.availability
      if (data.experience) partner.experience = data.experience
      if (data.description) partner.description = data.description

      await partner.save()

      return response.json({
        message: 'Parceiro atualizado com sucesso!',
        partner: partner.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Deletar parceiro Stock Store
   */
  async deleteStockStorePartner({ params, response }) {
    try {
      const partner = await StockStorePartner.findOrFail(params.id)
      await partner.delete()

      return response.status(204).send()

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = StockStorePartnerController
