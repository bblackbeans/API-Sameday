'use strict'

const Model = use('Model')

class StockStorePartner extends Model {
  static get table() {
    return 'stock_store_partners'
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
      'owner_name',
      'email',
      'phone',
      'cpf_cnpj',
      'property_type',
      'address',
      'space_size',
      'availability',
      'experience',
      'description',
      'status'
    ]
  }

  // Validações
  static get rules() {
    return {
      owner_name: 'required|string|max:100',
      email: 'required|email|max:120',
      phone: 'required|string|max:20',
      cpf_cnpj: 'required|string|max:18',
      property_type: 'required|string|max:50',
      address: 'required|string',
      space_size: 'string|max:20',
      availability: 'string|max:50',
      experience: 'string|max:200',
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
      owner_name: this.owner_name,
      email: this.email,
      phone: this.phone,
      cpf_cnpj: this.cpf_cnpj,
      property_type: this.property_type,
      address: this.address,
      space_size: this.space_size,
      availability: this.availability,
      experience: this.experience,
      description: this.description,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

module.exports = StockStorePartner
