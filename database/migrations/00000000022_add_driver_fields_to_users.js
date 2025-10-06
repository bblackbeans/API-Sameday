'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddDriverFieldsToUsersSchema extends Schema {
  up() {
    this.table('users', (table) => {
      // Campos básicos do entregador (apenas os que não existem)
      table.string('cpf', 14).nullable()
      table.date('birth_date').nullable()
      table.string('vehicle_type', 50).nullable()
      table.string('role', 20).defaultTo('user')
      
      // Documentos
      table.string('cnh_document').nullable()
      table.string('selfie_document').nullable()
      table.string('crlv_document').nullable()
      table.string('insurance_document').nullable()
      
      // Dados do veículo (JSON)
      table.text('vehicle_data').nullable()
      
      // Dados de pagamento (JSON)
      table.text('payment_data').nullable()
      
      // Estatísticas do entregador
      table.decimal('rating', 3, 2).defaultTo(0)
      table.integer('total_deliveries').defaultTo(0)
      table.decimal('success_rate', 5, 2).defaultTo(0)
      table.decimal('total_earnings', 10, 2).defaultTo(0)
      table.decimal('total_distance', 10, 2).defaultTo(0)
      
      // Onboarding
      table.boolean('has_completed_onboarding').defaultTo(false)
      
      // Índices
      table.index(['cpf'])
      table.index(['role'])
    })
  }

  down() {
    this.table('users', (table) => {
      table.dropColumn('cpf')
      table.dropColumn('birth_date')
      table.dropColumn('vehicle_type')
      table.dropColumn('role')
      table.dropColumn('cnh_document')
      table.dropColumn('selfie_document')
      table.dropColumn('crlv_document')
      table.dropColumn('insurance_document')
      table.dropColumn('vehicle_data')
      table.dropColumn('payment_data')
      table.dropColumn('rating')
      table.dropColumn('total_deliveries')
      table.dropColumn('success_rate')
      table.dropColumn('total_earnings')
      table.dropColumn('total_distance')
      table.dropColumn('has_completed_onboarding')
    })
  }
}

module.exports = AddDriverFieldsToUsersSchema
