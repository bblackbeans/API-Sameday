'use strict'

const Shipper = use('App/Models/Base/Shippers')
const Database = use('Database')

class ShipperController {
  /**
   * Criar novo embarcador
   */
  async postShipper({ request, response }) {
    try {
      const data = request.only([
        'companyName',
        'cnpj',
        'contactName',
        'email',
        'phone',
        'address',
        'businessType',
        'monthlyVolume',
        'description'
      ])

      // Validação básica
      const requiredFields = ['companyName', 'cnpj', 'contactName', 'email', 'phone', 'address']
      for (const field of requiredFields) {
        if (!data[field]) {
          return response.status(400).json({
            error: `Campo ${field} é obrigatório`
          })
        }
      }

      // Verificar se CNPJ já existe
      const existingShipper = await Shipper.query()
        .where('cnpj', data.cnpj)
        .first()

      if (existingShipper) {
        return response.status(409).json({
          error: 'CNPJ já cadastrado'
        })
      }

      // Criar novo embarcador
      const shipper = await Shipper.create({
        company_name: data.companyName,
        cnpj: data.cnpj,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        business_type: data.businessType,
        monthly_volume: data.monthlyVolume,
        description: data.description
      })

      return response.status(201).json({
        message: 'Embarcador cadastrado com sucesso!',
        shipper: shipper.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Listar embarcadores
   */
  async getShippers({ request, response }) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const status = request.input('status')

      let query = Shipper.query()

      if (status) {
        query = query.where('status', status)
      }

      const shippers = await query
        .orderBy('created_at', 'desc')
        .paginate(page, perPage)

      return response.json({
        shippers: shippers.toJSON().data,
        total: shippers.toJSON().total,
        pages: shippers.toJSON().lastPage,
        current_page: page
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Obter embarcador específico
   */
  async getShipper({ params, response }) {
    try {
      const shipper = await Shipper.findOrFail(params.id)
      return response.json(shipper.toJSON())

    } catch (error) {
      return response.status(404).json({
        error: 'Embarcador não encontrado'
      })
    }
  }

  /**
   * Atualizar status do embarcador
   */
  async putShipperStatus({ params, request, response }) {
    try {
      const { status } = request.only(['status'])

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return response.status(400).json({
          error: 'Status inválido'
        })
      }

      const shipper = await Shipper.findOrFail(params.id)
      shipper.status = status
      await shipper.save()

      return response.json({
        message: 'Status atualizado com sucesso!',
        shipper: shipper.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Atualizar embarcador
   */
  async putShipper({ params, request, response }) {
    try {
      const data = request.only([
        'companyName',
        'contactName',
        'email',
        'phone',
        'address',
        'businessType',
        'monthlyVolume',
        'description'
      ])

      const shipper = await Shipper.findOrFail(params.id)

      // Atualizar campos
      if (data.companyName) shipper.company_name = data.companyName
      if (data.contactName) shipper.contact_name = data.contactName
      if (data.email) shipper.email = data.email
      if (data.phone) shipper.phone = data.phone
      if (data.address) shipper.address = data.address
      if (data.businessType) shipper.business_type = data.businessType
      if (data.monthlyVolume) shipper.monthly_volume = data.monthlyVolume
      if (data.description) shipper.description = data.description

      await shipper.save()

      return response.json({
        message: 'Embarcador atualizado com sucesso!',
        shipper: shipper.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Deletar embarcador
   */
  async deleteShipper({ params, response }) {
    try {
      const shipper = await Shipper.findOrFail(params.id)
      await shipper.delete()

      return response.status(204).send()

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = ShipperController
