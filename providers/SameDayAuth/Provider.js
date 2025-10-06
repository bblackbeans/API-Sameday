'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const { sameDay } = require('./Schemes')

class SameDayAuthProvider extends ServiceProvider {
    register() {
        this.app.extend('Adonis/Src/Auth', 'sameDay', () => {
            return sameDay
        }, 'scheme')
    }
}

module.exports = SameDayAuthProvider