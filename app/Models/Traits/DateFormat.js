'use strict'

class DateFormat {
  register(Model, customOptions = {}) {
    const defaultOptions = { format: 'YYYY-MM-DD' }
    const options = Object.assign(defaultOptions, customOptions)

    const fields = Model.dateFormat || []
    Model.castDates = function (field, value) {
      if (fields.includes(field)) {
        return value.format(options.format)
      }

      return Model.formatDates(field, value)
    }
  }
}

module.exports = DateFormat