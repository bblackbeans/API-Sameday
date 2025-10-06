'use strict'

const Model = use('Model')

class Carrier extends Model {
  static get table() {
    return 'carriers'
  }

  static get primaryKey() {
    return 'id'
  }

  static get createdAtColumn() {
    return 'created_at'
  }

  static get updatedAtColumn() {
    return 'updated_at'
  }

  static get dates() {
    return super.dates.concat(['created_at', 'updated_at'])
  }

  // Campos da tabela
  static get fillable() {
    return [
      'company_name',
      'cnpj',
      'contact_name',
      'email',
      'phone',
      'address',
      'rntrc',
      'fleet_size',
      'vehicle_types',
      'operation_areas',
      'experience',
      'description',
      'status'
    ]
  }

  // Validações
  static get rules() {
    return {
      company_name: 'required|string|max:200',
      cnpj: 'required|string|max:18|unique:carriers,cnpj',
      contact_name: 'required|string|max:100',
      email: 'required|email|max:120',
      phone: 'required|string|max:20',
      address: 'required|string',
      rntrc: 'required|string|max:50',
      fleet_size: 'string|max:20',
      vehicle_types: 'string|max:200',
      operation_areas: 'string|max:200',
      experience: 'string|max:20',
      description: 'string',
      status: 'string|in:pending,approved,rejected'
    }
  }

  // Relacionamentos
  user() {
    return this.belongsTo('App/Models/Base/Users', 'user_id', 'id')
  }

  // Scopes
  static scopePending(query) {
    return query.where('status', 'pending')
  }

  static scopeApproved(query) {
    return query.where('status', 'approved')
  }

  static scopeRejected(query) {
    return query.where('status', 'rejected')
  }

  // Métodos auxiliares
  toJSON() {
    return {
      id: this.id,
      company_name: this.company_name,
      cnpj: this.cnpj,
      contact_name: this.contact_name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      rntrc: this.rntrc,
      fleet_size: this.fleet_size,
      vehicle_types: this.vehicle_types,
      operation_areas: this.operation_areas,
      experience: this.experience,
      description: this.description,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

module.exports = Carrier
