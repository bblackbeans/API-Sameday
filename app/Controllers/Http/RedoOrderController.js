'use strict'
const Orders = use('App/Models/Base/Orders')
const Items = use('App/Models/Base/Items')
const Users = use('App/Models/Base/Users')
const Addresses = use('App/Models/Base/Addresses')

const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_TOKEN
const client = require('twilio')(accountSid, authToken)

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

const moment = require('moment')

class RedoOrderController {

  async index() {
    try {
      const orders = await Orders.query().with('userClient', (builder) => {
        builder.where('typeUser', 'client')
      }).with('userBusiness', (builder) => {
        builder.where('typeUser', 'business')
      }).fetch()

      return orders
    } catch (error) {
      console.log(error)
    }
  }

  async show({
    params
  }) {
    const order = await Orders.findOrFail(params.id)

    const idBusiness = order.toJSON().idBusiness
    const idClient = order.toJSON().idClient

    const collectionSite = await Users.query().where('id', idBusiness).with('address').fetch()
    const deliveryPlace = await Users.query().where('id', idClient).with('address').fetch()
    const items = await Items.query().where('idOrder', params.id).fetch()

    return {
      order,
      items,
      collectionSite: collectionSite.toJSON()[0],
      deliveryPlace: deliveryPlace.toJSON()[0]
    }
  }

  async showItems({
    params
  }) {
    const items = await Items.query().where('idOrder', params.id).fetch()

    return items
  }

  async store({
    request
  }) {
    try {
      const message = {
        app_id: "966bae18-da85-416f-8ad4-d29c40d3cdeb",
        contents: {
          "en": "Wow!! Tem um novo pedido, entre no app."
        },
        included_segments: ["Subscribed Users"]
      }

      sendNotification(message)

      const {
        params
      } = request.only(['params'])

      const {
        collectionSite,
        deliveryPlace,
        items
      } = params

      const findBusiness = await Users.query().where('cpfcnpj', collectionSite.cpfcnpj).fetch()

      const findClient = await Users.query().where('cpfcnpj', deliveryPlace.cpfcnpj).fetch()

      let savedBusiness
      if (findBusiness.toJSON().length <= 0) {
        await this.saveUserIfNotExists(collectionSite).then(res => {
          savedBusiness = res
        })
      } else {
        savedBusiness = findBusiness.toJSON()[0]
      }

      let savedClient
      if (findClient.toJSON().length <= 0) {
        await this.saveUserIfNotExists(deliveryPlace).then(res => {
          savedClient = res
        })
      } else {
        savedClient = findClient.toJSON()[0]
      }

      const data = {
        idBusiness: savedBusiness.id,
        idClient: savedClient.id,
        idAddress: 1,
        status: 'execution',
        dateLaunch: new Date(),
        codeDelivery: this.getDeliveryCode()
      }

      const order = await Orders.create(data)

      // const orderChannel = Ws.getChannel('order:*').topic(`order:${order.toJSON().id}`)

      // if (orderChannel) {
      // orderChannel.broadcastToAll(order.toString())
      // }

      items.forEach(async (element) => {
        element.idOrder = order.toJSON().id
        await Items.create(element)
      })

      return order
    } catch (error) {
      console.log(error)
    }
  }

  async saveUserIfNotExists(data) {
    const user = {
      cpfcnpj: data.cpfcnpj,
      phone: data.phone,
      fantasyName: data.fantasyName,
      name: data.name,
      email: data.email
    }

    const userCreated = await Users.create(user)

    const address = {
      idUser: userCreated.toJSON().id,
      state: data.state,
      city: data.city,
      number: data.number,
      zipCode: data.zipCode,
      address: data.address,
      district: data.district
    }

    await Addresses.create(address)

    return userCreated.toJSON()
  }

  async update({
    params,
    request
  }) {
    try {
      const data = request.only(['params'])

      const {
        collectionSite,
        deliveryPlace,
        items
      } = data.params

      await items.forEach(async (element) => {
        if (element.id) {
          await Items.query().where('idOrder', params.id).where('id', element.id).update(element)
        } else {
          await Items.create({
            idOrder: params.id,
            ...element
          })
        }
      })

      await this.updateUserWhenUpdate(collectionSite)

      await this.updateUserWhenUpdate(deliveryPlace)

    } catch (error) {
      console.log(error)
    }
  }

  async updateUserWhenUpdate(data) {
    const user = {
      cpfcnpj: data.cpfcnpj,
      phone: data.phone,
      fantasyName: data.fantasyName,
      name: data.name,
      email: data.email
    }

    await Users.query().where('cpfcnpj', data.cpfcnpj).update(user)

    const address = {
      state: data.state,
      city: data.city,
      number: data.number,
      zipCode: data.zipCode,
      address: data.address,
      district: data.district
    }

    await Addresses.query().where('idUser', data.id).update(address)
  }

  async destroy({
    params
  }) {
    try {
      const order = await Orders.findOrFail(params.id)

      await order.delete()
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }

  async sendSms({
    params,
    request
  }) {
    try {
      const {
        messageIndex
      } = request.only(['messageIndex'])

      const user = await Users.findOrFail(params.id)

      const {
        name,
        phone
      } = user

      const deliveryCode = this.getDeliveryCode()

      /**
       * @replace if exists plus (+) remove
       */
      phone.replace('+', '')

      const bodys = [
        `SameDay: Olá ${name}, seu produto saiu para entrega! O código da entrega é: ${deliveryCode}`
      ]

      const response = await client.messages.create({
        body: bodys[messageIndex], // send in body the properties messageIndex contain number of position in array: ex: 0, 1, 2
        from: `+${process.env.PHONE_NUMBER}`,
        to: `+55${phone}`
      })

      return response
    } catch (error) {
      console.log(error)
    }
  }

  getDeliveryCode() {
    return Math.random().toString(36).slice(-10).toUpperCase()
  }

  async getPendingOrder({
    params
  }) {
    const order = await Orders.query().where('idClient', params.id).where('status', 'pending').with('userBusiness', (userBusiness) => {
      userBusiness.with('address')
    }).with('userClient', (userClient) => {
      userClient.with('address')
    }).fetch()

    return order
  }

  async finishOrder({
    params,
    request
  }) {
    const order = await Orders.findOrFail(params.id)

    order.merge(request.all())
    order.save()

    return order
  }

  /**
   * GET /orders/driver/:idDriver
   *
   * @param {object} ctx
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getOrdersDriver({
    params,
    request,
    response
  }) {
    try {

      let {
        idDriver
      } = params

      let existsUser = await Users.query()
        .where('id', idDriver)
        .select('id', 'typeUser')
        .first()

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (existsUser.typeUser !== 'driver') {
        response.status(400)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      const allOrders = (await Orders.query()
        .where('idDriver', idDriver)
        .where('status', '!=', 'canceled')
        .where('status', '!=', 'finished')
        .select('id', 'status', 'deliveryStatus', 'duration', 'km', 'price', 'created_at')
        .with('orderInformation')
        .with('userClient')
        .with('items')
        .orderBy('created_at', 'DESC')
        .fetch()
      ).toJSON()

      const objReturn = {
        status: 'success',
        message: 'Pedidos carregados com sucesso!',
        orders: allOrders,
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * GET /order/driver/:idDriver/view/:idOrder
   *
   * @param {object} ctx
   * @param {params} ctx.params
   * @param {Response} ctx.response
   */
  async getOrderView({
    params,
    response
  }) {
    try {

      const {
        idDriver,
        idOrder
      } = params

      let existsUser = await Users.query()
        .where('id', idDriver)
        .select('id', 'typeUser')
        .first()

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (existsUser.typeUser !== 'driver') {
        response.status(400)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      let existsOrder = await Orders.query()
        .where('id', idOrder)
        .with('orderInformation')
        .with('items')
        .first()

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      const objReturn = {
        status: 'success',
        message: 'Pedido carregado com sucesso!',
        order: existsOrder
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }
}

module.exports = RedoOrderController
