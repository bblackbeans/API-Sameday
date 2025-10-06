'use strict'
const _ = require('lodash')
const QueryBuilder = require('@adonisjs/lucid/src/Lucid/QueryBuilder')

class Tenancy {
  register(Model) {
    /**
     * Replace
     */
    Model.tenancy = (options) => {
      const connection = options && options.connection ? options.connection : this.connection
      const query = new (Model.QueryBuilder || QueryBuilder)(Model, connection)

      /**
       * Listening for query event and executing
       * listeners if any
       */
      query.on('query', (builder) => {
        _(this.$queryListeners)
          .filter((listener) => typeof (listener) === 'function')
          .each((listener) => listener(builder))
      })

      return query
    }
  }
}

module.exports = Tenancy