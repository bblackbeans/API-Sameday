'use strict'

const Shipper = use('App/Models/Base/Shippers')
const Carrier = use('App/Models/Base/Carriers')
const StockStorePartner = use('App/Models/Base/StockStorePartners')
const Contact = use('App/Models/Base/Contacts')
const Database = use('Database')

class PartnersDashboardController {
  /**
   * Obter estatísticas do dashboard de parceiros
   */
  async getDashboardStats({ response }) {
    try {
      // Contadores gerais
      const totalShippers = await Shipper.query().count('* as total')
      const totalCarriers = await Carrier.query().count('* as total')
      const totalPartners = await StockStorePartner.query().count('* as total')
      const totalContacts = await Contact.query().count('* as total')

      // Contadores por status - Embarcadores
      const shippersPending = await Shipper.query().where('status', 'pending').count('* as total')
      const shippersApproved = await Shipper.query().where('status', 'approved').count('* as total')
      const shippersRejected = await Shipper.query().where('status', 'rejected').count('* as total')

      // Contadores por status - Transportadores
      const carriersPending = await Carrier.query().where('status', 'pending').count('* as total')
      const carriersApproved = await Carrier.query().where('status', 'approved').count('* as total')
      const carriersRejected = await Carrier.query().where('status', 'rejected').count('* as total')

      // Contadores por status - Parceiros Stock Store
      const partnersPending = await StockStorePartner.query().where('status', 'pending').count('* as total')
      const partnersApproved = await StockStorePartner.query().where('status', 'approved').count('* as total')
      const partnersRejected = await StockStorePartner.query().where('status', 'rejected').count('* as total')

      // Contadores por status - Contatos
      const contactsNew = await Contact.query().where('status', 'new').count('* as total')
      const contactsInProgress = await Contact.query().where('status', 'in_progress').count('* as total')
      const contactsResolved = await Contact.query().where('status', 'resolved').count('* as total')

      return response.json({
        totals: {
          shippers: totalShippers[0].total,
          carriers: totalCarriers[0].total,
          partners: totalPartners[0].total,
          contacts: totalContacts[0].total
        },
        shippers: {
          pending: shippersPending[0].total,
          approved: shippersApproved[0].total,
          rejected: shippersRejected[0].total
        },
        carriers: {
          pending: carriersPending[0].total,
          approved: carriersApproved[0].total,
          rejected: carriersRejected[0].total
        },
        partners: {
          pending: partnersPending[0].total,
          approved: partnersApproved[0].total,
          rejected: partnersRejected[0].total
        },
        contacts: {
          new: contactsNew[0].total,
          in_progress: contactsInProgress[0].total,
          resolved: contactsResolved[0].total
        }
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Obter atividades recentes
   */
  async getRecentActivities({ request, response }) {
    try {
      const limit = request.input('limit', 10)

      // Últimos cadastros
      const recentShippers = await Shipper.query()
        .orderBy('created_at', 'desc')
        .limit(limit)

      const recentCarriers = await Carrier.query()
        .orderBy('created_at', 'desc')
        .limit(limit)

      const recentPartners = await StockStorePartner.query()
        .orderBy('created_at', 'desc')
        .limit(limit)

      const recentContacts = await Contact.query()
        .orderBy('created_at', 'desc')
        .limit(limit)

      return response.json({
        recent_shippers: recentShippers.map(shipper => shipper.toJSON()),
        recent_carriers: recentCarriers.map(carrier => carrier.toJSON()),
        recent_partners: recentPartners.map(partner => partner.toJSON()),
        recent_contacts: recentContacts.map(contact => contact.toJSON())
      })

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Exportar dados
   */
  async exportData({ params, response }) {
    try {
      const { entityType } = params
      let csvData = ''

      if (entityType === 'shippers') {
        const data = await Shipper.all()
        csvData = "ID,Empresa,CNPJ,Contato,Email,Telefone,Status,Data Cadastro\n"
        data.forEach(item => {
          csvData += `${item.id},${item.company_name},${item.cnpj},${item.contact_name},${item.email},${item.phone},${item.status},${item.created_at}\n`
        })

      } else if (entityType === 'carriers') {
        const data = await Carrier.all()
        csvData = "ID,Empresa,CNPJ,Contato,Email,Telefone,RNTRC,Status,Data Cadastro\n"
        data.forEach(item => {
          csvData += `${item.id},${item.company_name},${item.cnpj},${item.contact_name},${item.email},${item.phone},${item.rntrc},${item.status},${item.created_at}\n`
        })

      } else if (entityType === 'partners') {
        const data = await StockStorePartner.all()
        csvData = "ID,Nome,Email,Telefone,CPF/CNPJ,Tipo Propriedade,Status,Data Cadastro\n"
        data.forEach(item => {
          csvData += `${item.id},${item.owner_name},${item.email},${item.phone},${item.cpf_cnpj},${item.property_type},${item.status},${item.created_at}\n`
        })

      } else if (entityType === 'contacts') {
        const data = await Contact.all()
        csvData = "ID,Nome,Email,Assunto,Tipo Usuário,Status,Data Contato\n"
        data.forEach(item => {
          csvData += `${item.id},${item.name},${item.email},${item.subject},${item.user_type},${item.status},${item.created_at}\n`
        })

      } else {
        return response.status(400).json({
          error: 'Tipo de entidade inválido'
        })
      }

      response.header('Content-Type', 'text/csv')
      response.header('Content-Disposition', `attachment; filename=${entityType}_export.csv`)
      return response.send(csvData)

    } catch (error) {
      return response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = PartnersDashboardController
