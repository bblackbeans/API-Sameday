'use strict'

const Model = use('Model')

class Contact extends Model {
  static get table() {
    return 'contacts'
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
      'name',
      'email',
      'phone',
      'subject',
      'message',
      'user_type',
      'status'
    ]
  }

  // Validações
  static get rules() {
    return {
      name: 'required|string|max:100',
      email: 'required|email|max:120',
      phone: 'string|max:20',
      subject: 'required|string|max:200',
      message: 'required|string',
      user_type: 'string|max:50',
      status: 'string|in:new,in_progress,resolved'
    }
  }

  // Scopes
  static scopeNew(query) {
    return query.where('status', 'new')
  }

  static scopeInProgress(query) {
    return query.where('status', 'in_progress')
  }

  static scopeResolved(query) {
    return query.where('status', 'resolved')
  }

  static scopeByUserType(query, userType) {
    return query.where('user_type', userType)
  }

  // Métodos auxiliares
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      subject: this.subject,
      message: this.message,
      user_type: this.user_type,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

module.exports = Contact
