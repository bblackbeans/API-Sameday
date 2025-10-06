'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const Users = use('App/Models/Base/Users')
const Orders = use('App/Models/Base/Orders')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

const moment = require('moment')
const _ = require('lodash')
const {
  split
} = require('lodash')

class DashboardController {
  constructor() {}

  /**
   * GET /dashboard/data
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async getDashboardData({
    auth,
    response
  }) {
    try {

      let totals = {
        kms: 0,
        driver: 0,
        client: 0,
        goodsDelivered: 0
      }

      let idUser = 0
      if (auth.user) {
        idUser = auth.user.id
      }

      let existsUser = await Users.query()
        .where('id', idUser)
        .select('id', 'profile')
        .first()

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (existsUser.profile !== 'administrator') {
        response.status(401)
        return response.json(ErrorController.error('error', '00005', null))
      }

      const allUsers = (await Users.query()
        .where('status', 'active')
        .select('id', 'typeUser')
        .fetch()).toJSON()

      if (allUsers.length) {
        totals = {
          driver: allUsers.filter((row) => row.typeUser === 'driver').length,
          client: allUsers.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length,
        }
      }

      const allOrders = (await Orders.query()
        .where('status', 'pending') // For testing we will use pending orders - Later -> (finished)
        .select('id', 'km', 'price')
        .fetch()).toJSON()

      if (allOrders.length) {
        let real = 0
        let cents = 0
        let accumulateM = 0
        let moneyCurrentReal = 0
        let moneyCurrentCents = 0

        allOrders.forEach(order => {
          const split = order.km.split(' ')
          const splitMoney = order.price.split(',')

          switch (split[1]) {
            case 'km':
              accumulateM += Number(split[0].replace(',', '.')) * 1000
              break
            case 'm':
              accumulateM += Number(split[0].replace(',', '.'))
              break
          }

          moneyCurrentReal += Number(splitMoney[0].replace('.', ''))
          moneyCurrentCents += Number(splitMoney[1])
        })

        if (moneyCurrentCents >= 100) {
          const stringMoneyCents = String(moneyCurrentCents)

          real = stringMoneyCents.substring(0, stringMoneyCents.length - 2)
          cents = stringMoneyCents.substr(-2)
        } else if (moneyCurrentCents === 0) {
          moneyCurrentCents = '00'
        }

        totals.goodsDelivered = cents ? `${moneyCurrentReal + Number(real)},${cents}` : `${moneyCurrentReal},${moneyCurrentCents}`
        const numberMoney = parseFloat(totals.goodsDelivered)

        if (numberMoney >= 1000 && numberMoney < 1000000) {
          totals.goodsDelivered = `${totals.goodsDelivered}M`

        } else if (numberMoney >= 1000000 && numberMoney >= 999999999999) {
          totals.goodsDelivered = `${totals.goodsDelivered}MM`
        }

        if (accumulateM >= 1000) {
          const turnIntoKM = accumulateM / 1000

          totals.kms = `${turnIntoKM}` + ' KM'
        } else {
          totals.kms = `${accumulateM}` + ' M'
        }
      }

      const objReturn = {
        status: 'success',
        message: 'Informações carregadas com sucesso!',
        totals: totals
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * GET /dashboard/graphics
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getDashboardGraphics({
    auth,
    request,
    response
  }) {
    try {

      let allUsers = []
      let allOrders = []
      let arrayTime = []

      let totals = {
        kms: {
          an: 0,
          two: 0,
          three: 0,
          four: 0,
          five: 0,
          six: 0,
          seven: 0,
        },
        driver: {
          an: 0,
          two: 0,
          three: 0,
          four: 0,
          five: 0,
          six: 0,
          seven: 0,
        },
        client: {
          an: 0,
          two: 0,
          three: 0,
          four: 0,
          five: 0,
          six: 0,
          seven: 0,
        },
        goodsDelivered: {
          an: 0,
          two: 0,
          three: 0,
          four: 0,
          five: 0,
          six: 0,
          seven: 0,
        }
      }

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.get()
      }

      const {
        type
      } = bodyData

      let idUser = 0
      if (auth.user) {
        idUser = auth.user.id
      }

      let existsUser = await Users.query()
        .where('id', idUser)
        .select('id', 'profile')
        .first()

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (existsUser.profile !== 'administrator') {
        response.status(401)
        return response.json(ErrorController.error('error', '00005', null))
      }

      for (let index = 0; index < 7; index++) {
        switch (type) {
          case 'days':
            const day = moment().add(`-${index}`, 'days').format('YYYY-MM-DD').toUpperCase()
            allUsers = (await Users.query()
              .where('status', 'active')
              .where(q => {
                q.whereBetween('created_at', [`${day} 00:00:00`, `${day} 23:59:59`])
              })
              .select('id', 'typeUser')
              .fetch()).toJSON()

            allOrders = (await Orders.query()
              // .where('status', 'finished')
              .where(q => {
                q.whereBetween('created_at', [`${day} 00:00:00`, `${day} 23:59:59`])
              })
              .select('id', 'km', 'price')
              .fetch()).toJSON()

            arrayTime.push({
              index: index + 1,
              users: allUsers,
              orders: allOrders
            })
            break
          case 'months':
            const months = moment().add(`-${index}`, 'months').format('YYYY-MM').toUpperCase()
            const split = months.split('-')
            const startMonth = moment([`${split[0]}`, `${split[1]}`]).startOf('month').format('YYYY-MM-DD')
            const endMonth = moment([`${split[0]}`, `${split[1]}`]).endOf('month').format('YYYY-MM-DD')

            allUsers = (await Users.query()
              .where('status', 'active')
              .where(q => {
                q.whereBetween('created_at', [`${startMonth} 00:00:00`, `${endMonth} 23:59:59`])
              })
              .select('id', 'typeUser')
              .fetch()).toJSON()

            allOrders = (await Orders.query()
              // .where('status', 'finished')
              .where(q => {
                q.whereBetween('created_at', [`${startMonth} 00:00:00`, `${endMonth} 23:59:59`])
              })
              .select('id', 'km', 'price')
              .fetch()).toJSON()

            arrayTime.push({
              index: index + 1,
              users: allUsers,
              orders: allOrders
            })
            break
          case 'years':
            const years = moment().add(`-${index}`, 'years').format('YYYY').toUpperCase()
            const startYear = moment([`${years}`]).startOf('year').format('YYYY-MM-DD')
            const endYear = moment([`${years}`]).endOf('year').format('YYYY-MM-DD')

            allUsers = (await Users.query()
              .where('status', 'active')
              .where(q => {
                q.whereBetween('created_at', [`${startYear} 00:00:00`, `${endYear} 23:59:59`])
              })
              .select('id', 'typeUser')
              .fetch()).toJSON()

            allOrders = (await Orders.query()
              // .where('status', 'finished')
              .where(q => {
                q.whereBetween('created_at', [`${startYear} 00:00:00`, `${endYear} 23:59:59`])
              })
              .select('id', 'km', 'price')
              .fetch()).toJSON()

            arrayTime.push({
              index: index + 1,
              users: allUsers,
              orders: allOrders
            })
            break
        }
      }

      function calculate(arrayOrders, formated = false, returnParameter) {
        if (arrayOrders.length) {
          let kms = 0
          let real = 0
          let cents = 0
          let accumulateM = 0
          let goodsDelivered = 0
          let moneyCurrentReal = 0
          let moneyCurrentCents = 0

          arrayOrders.forEach(order => {
            const split = order.km.split(' ')
            const splitMoney = order.price.split(',')

            switch (split[1]) {
              case 'km':
                accumulateM += Number(split[0].replace(',', '.')) * 1000
                break
              case 'm':
                accumulateM += Number(split[0].replace(',', '.'))
                break
            }

            moneyCurrentReal += Number(splitMoney[0].replace('.', ''))
            moneyCurrentCents += Number(splitMoney[1])
          })

          if (moneyCurrentCents >= 100) {
            const stringMoneyCents = String(moneyCurrentCents)

            real = stringMoneyCents.substring(0, stringMoneyCents.length - 2)
            cents = stringMoneyCents.substr(-2)
          } else if (moneyCurrentCents === 0) {
            moneyCurrentCents = '00'
          }

          goodsDelivered = cents ? `${moneyCurrentReal + Number(real)}.${cents}` : `${moneyCurrentReal}.${moneyCurrentCents}`
          const numberMoney = parseFloat(goodsDelivered)

          if (numberMoney >= 1000 && numberMoney < 1000000) {
            goodsDelivered = formated ? `${goodsDelivered}M` : `${goodsDelivered}`

          } else if (numberMoney >= 1000000 && numberMoney >= 999999999999) {
            goodsDelivered = formated ? `${goodsDelivered}MM` : `${goodsDelivered}`
          }

          if (accumulateM >= 1000) {
            const turnIntoKM = accumulateM / 1000

            kms = formated ? `${turnIntoKM}` + ' KM' : `${turnIntoKM}`
          } else {
            kms = formated ? `${accumulateM}` + ' M' : `${accumulateM}`
          }

          if (returnParameter === 'kms') {
            return kms
          } else {
            return goodsDelivered
          }
        } else {
          return {
            kms: 0,
            goodsDelivered: 0
          }
        }
      }

      arrayTime.forEach(time => {
        switch (time.index) {
          case 1:
            // Users
            totals.driver.an += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.an += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.an = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.an = calculate(time.orders, false, 'goodsDelivered')
            break
          case 2:
            // Users
            totals.driver.two += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.two += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.two = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.two = calculate(time.orders, false, 'goodsDelivered')
            break
          case 3:
            // Users
            totals.driver.three += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.three += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.three = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.three = calculate(time.orders, false, 'goodsDelivered')
            break
          case 4:
            // Users
            totals.driver.four += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.four += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.four = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.four = calculate(time.orders, false, 'goodsDelivered')
            break
          case 5:
            // Users
            totals.driver.five += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.five += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.five = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.five = calculate(time.orders, false, 'goodsDelivered')
            break
          case 6:
            // Users
            totals.driver.six += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.six += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.six = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.six = calculate(time.orders, false, 'goodsDelivered')
            break
          case 7:
            // Users
            totals.driver.seven += time.users.filter((row) => row.typeUser === 'driver').length
            totals.client.seven += time.users.filter((row) => row.typeUser === 'client' || row.typeUser === 'business').length
            // Orders
            totals.kms.seven = calculate(time.orders, false, 'kms')
            totals.goodsDelivered.seven = calculate(time.orders, false, 'goodsDelivered')
            break
        }
      })

      const objReturn = {
        status: 'success',
        message: 'Informações carregadas com sucesso!',
        totals: totals
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }
}

module.exports = DashboardController
