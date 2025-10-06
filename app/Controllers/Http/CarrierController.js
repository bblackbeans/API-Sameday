'use strict'

const Carrier = use('App/Models/Base/Carriers')
const Database = use('Database')

class CarrierController {
  /**
   * Criar novo transportador
   */
  async postCarrier({ request, response }) {
    try {
      const data = request.only([
        'companyName',
        'cnpj',
        'contactName',
        'email',
        'phone',
        'address',
        'rntrc',
        'fleetSize',
        'vehicleTypes',
        'operationAreas',
        'experience',
        'description'
      ])

      // Validação básica
      const requiredFields = ['companyName', 'cnpj', 'contactName', 'email', 'phone', 'address', 'rntrc']
      for (const field of requiredFields) {
        if (!data[field]) {
          return response.status(400).json({
            error: `Campo ${field} é obrigatório`
          })
        }
      }

      // Verificar se CNPJ já existe
      const existingCarrier = await Carrier.query()
        .where('cnpj', data.cnpj)
        .first()

      if (existingCarrier) {
        return response.status(409).json({
          error: 'CNPJ já cadastrado'
        })
      }

      // Criar novo transportador
      const carrier = await Carrier.create({
        company_name: data.companyName,
        cnpj: data.cnpj,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        rntrc: data.rntrc,
        fleet_size: data.fleetSize,
        vehicle_types: data.vehicleTypes,
        operation_areas: data.operationAreas,
        experience: data.experience,
        description: data.description
      })

      return response.status(201).json({
        message: 'Transportador cadastrado com sucesso!',
        carrier: carrier.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Listar transportadores
   */
  async getCarriers({ request, response }) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const status = request.input('status')

      let query = Carrier.query()

      if (status) {
        query = query.where('status', status)
      }

      const carriers = await query
        .orderBy('created_at', 'desc')
        .paginate(page, perPage)

      return response.json({
        carriers: carriers.toJSON().data,
        total: carriers.toJSON().total,
        pages: carriers.toJSON().lastPage,
        current_page: page
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Obter transportador específico
   */
  async getCarrier({ params, response }) {
    try {
      const carrier = await Carrier.findOrFail(params.id)
      return response.json(carrier.toJSON())

    } catch (error) {
      return response.status(404).json({
        error: 'Transportador não encontrado'
      })
    }
  }

  /**
   * Atualizar status do transportador
   */
  async putCarrierStatus({ params, request, response }) {
    try {
      const { status } = request.only(['status'])

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return response.status(400).json({
          error: 'Status inválido'
        })
      }

      const carrier = await Carrier.findOrFail(params.id)
      carrier.status = status
      await carrier.save()

      return response.json({
        message: 'Status atualizado com sucesso!',
        carrier: carrier.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Atualizar transportador
   */
  async putCarrier({ params, request, response }) {
    try {
      const data = request.only([
        'companyName',
        'contactName',
        'email',
        'phone',
        'address',
        'fleetSize',
        'vehicleTypes',
        'operationAreas',
        'experience',
        'description'
      ])

      const carrier = await Carrier.findOrFail(params.id)

      // Atualizar campos
      if (data.companyName) carrier.company_name = data.companyName
      if (data.contactName) carrier.contact_name = data.contactName
      if (data.email) carrier.email = data.email
      if (data.phone) carrier.phone = data.phone
      if (data.address) carrier.address = data.address
      if (data.fleetSize) carrier.fleet_size = data.fleetSize
      if (data.vehicleTypes) carrier.vehicle_types = data.vehicleTypes
      if (data.operationAreas) carrier.operation_areas = data.operationAreas
      if (data.experience) carrier.experience = data.experience
      if (data.description) carrier.description = data.description

      await carrier.save()

      return response.json({
        message: 'Transportador atualizado com sucesso!',
        carrier: carrier.toJSON()
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Deletar transportador
   */
  async deleteCarrier({ params, response }) {
    try {
      const carrier = await Carrier.findOrFail(params.id)
      await carrier.delete()

      return response.status(204).send()

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = CarrierController
