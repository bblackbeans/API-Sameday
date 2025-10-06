'use strict'

class DateOnlyFormat {
  register(Model) {
    const fields = Model.dateOnly || []
    Model.castDates = function (field, value) {
      if (fields.includes(field)) {
        return value.format('YYYY-MM-DD')
      }

      return Model.formatDates(field, value)
    }
  }
}

module.exports = DateOnlyFormat