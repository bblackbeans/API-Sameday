'use strict'

const Model = use('Model')

class Shipper extends Model {
  static get table() {
    return 'shippers'
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
      'business_type',
      'monthly_volume',
      'description',
      'status'
    ]
  }

  // Validações
  static get rules() {
    return {
      company_name: 'required|string|max:200',
      cnpj: 'required|string|max:18|unique:shippers,cnpj',
      contact_name: 'required|string|max:100',
      email: 'required|email|max:120',
      phone: 'required|string|max:20',
      address: 'required|string',
      business_type: 'string|max:100',
      monthly_volume: 'string|max:50',
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
      business_type: this.business_type,
      monthly_volume: this.monthly_volume,
      description: this.description,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

module.exports = Shipper
