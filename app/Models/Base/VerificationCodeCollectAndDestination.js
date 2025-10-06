'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VerificationCodeCollectAndDestination extends Model {
    static boot() {
        super.boot()
        this.addTrait('NoTimestamp')
    }

    static get table() {
        return 'verification_code_collect_and_destination'
    }

    static get dates() {
        return ['created_at', 'updated_at', 'sendSmsDate']
    }

    order() {
        return this.hasOne('App/Models/Base/Orders', 'idOrder', 'id')
    }

    driver() {
        return this.hasOne('App/Models/Base/Users', 'idDriver', 'id')
    }
}

module.exports = VerificationCodeCollectAndDestination