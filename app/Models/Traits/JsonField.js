'use strict'

class JsonField {
  constructor() {
    this.fields = []
  }

  register(Model, options) {
    this.fields = (options.length > 0 ? options : null) || Model.prototype.jsonFields || []

    Model.addHook('beforeSave', this._beforeSave.bind(this))
    Model.addHook('afterSave', this._afterSave.bind(this))
    Model.addHook('afterFind', this._afterFind.bind(this))
    Model.addHook('afterFetch', this._afterFetch.bind(this))
    Model.addHook('afterPaginate', this._afterFetch.bind(this))
  }

  _beforeSave(instance) {
    for (const field of this.fields) {
      if (instance[field]) {
        instance[field] = JSON.stringify(instance[field])
      }
    }
  }

  _afterSave(instance) {
    for (const field of this.fields) {
      if (instance[field] && typeof instance[field] === 'string') {
        instance[field] = JSON.parse(instance[field])
      }
    }
  }

  _afterFind(instance) {
    for (const field of this.fields) {
      if (instance[field] && typeof instance[field] === 'string') {
        instance[field] = JSON.parse(instance[field])
      }
    }
  }

  _afterFetch(instances) {
    for (const instance of instances) {
      for (const field of this.fields) {
        if (instance[field] && typeof instance[field] === 'string') {
          instance[field] = JSON.parse(instance[field])
        }
      }
    }
  }
}

module.exports = JsonField