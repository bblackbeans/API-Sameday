'use strict'

class Base64Field {
  constructor() {
    this.fields = []
  }

  register(Model, options) {
    this.fields = (options.length > 0 ? options : null) || Model.prototype.base64Fields || []

    Model.addHook('afterSave', this._afterSave.bind(this))
    Model.addHook('afterFind', this._afterFind.bind(this))
    Model.addHook('afterFetch', this._afterFetch.bind(this))
    Model.addHook('afterPaginate', this._afterFetch.bind(this))
  }

  _afterSave(instance) {
    for (const field of this.fields) {
      if (instance[field] && typeof instance[field] === 'object') {
        instance[field] = instance[field].toString('utf8')
      }
    }
  }

  _afterFind(instance) {
    for (const field of this.fields) {
      if (instance[field] && typeof instance[field] === 'object') {
        instance[field] = instance[field].toString('utf8')
      }
    }
  }

  _afterFetch(instances) {
    for (const instance of instances) {
      for (const field of this.fields) {
        if (instance[field] && typeof instance[field] === 'object') {
          instance[field] = instance[field].toString('utf8')
        }
      }
    }
  }
}

module.exports = Base64Field
