'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const Users = use('App/Models/Base/Users')
const Items = use('App/Models/Base/Items')
const Orders = use('App/Models/Base/Orders')
const OrderInvoice = use('App/Models/Base/OrderInvoice');
const OrderInformation = use('App/Models/Base/OrderInformation')
const VerificationCodeCollectAndDestination = use('App/Models/Base/VerificationCodeCollectAndDestination')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')
/** @type {import('../../Services/Iugu')} */
const IuguService = use('App/Services/Iugu')

const moment = require('moment')
const _ = require('lodash')

class OrderController {
  constructor() { }

  /**
   * GET /order/all
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getOrderAll({
    auth,
    request,
    response
  }) {
    try {

      let totals = {
        statusAll: 0,
        statusPending: 0,
        statusCanceled: 0,
        statusFinished: 0,
        statusExecution: 0,
      }

      let idUser = 0
      if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
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

      let allOrders = null

      if (existsUser.profile === 'administrator') {
        allOrders = await Orders.query()
          .select('id', 'status', 'deliveryStatus', 'duration', 'km', 'price', 'created_at')
          .with('orderInvoice')
          .orderBy('created_at', 'desc')
          .fetch()
      } else {
        allOrders = await Orders.query()
          .where('idUser', idUser)
          .select('id', 'status', 'deliveryStatus', 'duration', 'km', 'price', 'created_at')
          .with('orderInvoice')
          .orderBy('created_at', 'desc')
          .fetch()
      }

      if (allOrders.rows.length) {
        totals = {
          statusAll: allOrders.rows.length,
          statusPending: allOrders.rows.filter((row) => row.status === 'pending').length,
          statusCanceled: allOrders.rows.filter((row) => row.status === 'canceled').length,
          statusFinished: allOrders.rows.filter((row) => row.status === 'finished').length,
          statusExecution: allOrders.rows.filter((row) => row.status === 'execution').length,
        }
      }

      const objReturn = {
        status: 'success',
        message: 'Pedidos carregados com sucesso!',
        orders: allOrders,
        totals: totals
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * GET /order
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getOrder({
    request,
    response
  }) {
    try {

      const bodyData = request.get()

      let idOrder = 0
      if (bodyData.idSelectedOrder) {
        idOrder = bodyData.idSelectedOrder
      }

      let existsOrder = await Orders.query()
        .where('id', idOrder)
        .with('orderInformation')
        .with('items')
        .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route')
        .first()

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      if (existsOrder.status === 'execution') {
        response.status(400)
        return response.json(ErrorController.error('order', '00005'))

      } else if (existsOrder.status === 'canceled') {
        response.status(400)
        return response.json(ErrorController.error('order', '00006'))

      } else if (existsOrder.status === 'finished') {
        response.status(400)
        return response.json(ErrorController.error('order', '00007'))
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

  /**
   * GET /order/historic
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getHistoric({
    request,
    response
  }) {
    try {

      const bodyData = request.get()

      let type = ''
      if (bodyData.type) {
        type = bodyData.type
      }

      if (!type) {
        response.status(400)
        return response.json(ErrorController.error('user', '00013'))
      }

      let idUser = 0
      if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
        idUser = auth.user.id
      }

      if (!idUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001', null, 'ID de usuário não informado!'))
      }

      let existsUser = (await Users.query()
        .where('id', idUser)
        .with('address')
        .first()).toJSON()

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001'))
      }

      let saveTreatedArray = []

      // Logged in user information
      const u = existsUser
      saveTreatedArray.push({
        name: u.name,
        phone: u.phone,
        email: u.email,
        cpfcnpj: u.cpfcnpj,
        typeUser: u.typeUser,
        city: u.address.city,
        state: u.address.state,
        number: u.address.number,
        fantasyName: u.fantasyName,
        zipCode: u.address.zipCode,
        address: u.address.address,
        district: u.address.district,
        latitude: u.address.latitude,
        longitude: u.address.longitude,
        complement: u.address.complement,
      })

      const info = (await OrderInformation.query()
        .where('idUser', idUser)
        .orderBy('created_at', 'DESC')
        .fetch()).toJSON()

      info.forEach(index => {
        saveTreatedArray.push(index.withdraw)
        saveTreatedArray.push(index.destiny)
      })

      // Return only records of type
      const saveTreatedArray2 = saveTreatedArray.filter((row) => row.typeUser === type)

      // Remove duplicate customer code with
      const customers = _.uniqBy(saveTreatedArray2, 'cpfcnpj')

      if (!customers.length) {
        response.status(400)
        return response.json(ErrorController.error('user', '00014'))
      }

      const objReturn = {
        status: 'success',
        message: 'Histórico carregado com sucesso!',
        historic: customers
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * GET /order/view
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getOrderView({
    request,
    response
  }) {
    try {

      const bodyData = request.get()

      let idOrder = 0
      if (bodyData.idSelectedOrder) {
        idOrder = bodyData.idSelectedOrder
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

  /**
   * POST /order
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async postOrder({
    auth,
    request,
    response
  }) {
    try {

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      let idUser = 0
      if (request.header('idUser')) {
        idUser = parseInt(request.header('idUser'))
      } else if (auth.user) {
        idUser = auth.user.id
      }

      if (!idUser) {
        response.status(400)
        return response.json(ErrorController.error('user', '00001', null, 'ID de usuário não informado!'))
      }

      let existsUser = await Users.find(idUser)

      if (!existsUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001'))
      }

      const {
        collectionSite,
        deliveryPlace,
        items
      } = bodyData.order

      const {
        km,
        route,
        price,
        duration,
        messageToDriver
      } = bodyData

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      // Create Order
      let createOrder = await Orders.create({
        km: km,
        price: price,
        route: JSON.stringify(route),
        idUser: idUser,
        status: 'pending',
        deliveryStatus: 'pending',
        duration: duration,
        messageToDriver: messageToDriver,
        created_at: date,
        updated_at: date
      })

      // Creates pickup and destination information regarding the user and the order
      await OrderInformation.create({
        idUser: idUser,
        idOrder: createOrder.id,
        withdraw: collectionSite,
        destiny: deliveryPlace,
        created_at: date,
        updated_at: date
      })

      // Create order-related items
      items.forEach(async (item) => {
        await Items.create({
          idOrder: createOrder.id,
          name: item.name,
          model: item.model,
          width: item.width,
          conversion_width: item.conversion_width,
          height: item.height,
          conversion_height: item.conversion_height,
          length: item.length,
          conversion_length: item.conversion_length,
          weight: item.weight,
          conversion_weight: item.conversion_weight,
          quantity: item.quantity,
          created_at: date,
          updated_at: date,
          ...item
        })
      })

      const objReturn = {
        status: 'success',
        message: 'Pedido cadastrado com sucesso!',
        data: { id: createOrder.id }
      }

      response.status(200)
      response.json(objReturn)

    } catch (error) {
      throw error
    }
  }

  /**
   * PUT /order
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async putOrder({
    request,
    response
  }) {
    try {

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        km,
        order,
        route,
        price,
        duration,
        messageToDriver,
        idSelectedOrder
      } = bodyData

      let existsOrder = await Orders.find(idSelectedOrder)

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      // Order
      await Orders.query()
        .where('id', idSelectedOrder)
        .update({
          km: km,
          price: price,
          route: JSON.stringify(route),
          duration: duration,
          messageToDriver: messageToDriver,
          updated_at: date
        })

      // Order Information - review later, error when trying to update
      await OrderInformation.query()
        .where('idOrder', idSelectedOrder)
        .delete()

      // Creates pickup and destination information regarding the user and the order
      await OrderInformation.create({
        idUser: existsOrder.idUser,
        idOrder: idSelectedOrder,
        withdraw: order.collectionSite,
        destiny: order.deliveryPlace,
        created_at: date,
        updated_at: date
      })

      // Items - review later, error when trying to update
      await Items.query()
        .where('idOrder', idSelectedOrder)
        .delete()

      // Create order-related items
      order.items.forEach(async (item) => {
        await Items.create({
          idOrder: idSelectedOrder,
          name: item.name,
          model: item.model,
          width: item.width,
          conversion_width: item.conversion_width,
          height: item.height,
          conversion_height: item.conversion_height,
          length: item.length,
          conversion_length: item.conversion_length,
          weight: item.weight,
          conversion_weight: item.conversion_weight,
          quantity: item.quantity,
          created_at: date,
          updated_at: date
        })
      })

      const objReturn = {
        status: 'success',
        message: 'Pedido atualizado com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * DELETE /order
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async deleteOrder({
    params,
    response
  }) {
    try {

      if (!params.idOrder) {
        response.status(400)
        return response.json(ErrorController.error('order', '00011'))
      }

      const idOrder = parseInt(params.idOrder)

      let existsOrder = await Orders.find(idOrder)

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      if (existsOrder.status === 'execution') {
        response.status(400)
        return response.json(ErrorController.error('order', '00008'))

      } else if (existsOrder.status === 'canceled') {
        response.status(400)
        return response.json(ErrorController.error('order', '00009'))

      } else if (existsOrder.status === 'finished') {
        response.status(400)
        return response.json(ErrorController.error('order', '00010'))
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      // Unlinks user information from the order and leaves information for user history
      await OrderInformation.query()
        .where('idOrder', idOrder)
        .update({
          idOrder: null,
          updated_at: date
        })

      await existsOrder.delete()

      const objReturn = {
        status: 'success',
        message: 'Pedido excluído com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * GET /order/value
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getOrderValue({
    auth,
    request,
    response
  }) {
    try {
      const bodyData = request.get()

      // Can later be replaced by values in the bank
      var distanceLimit = 4;
      var additionalPriceKM = 1.4;

      var rolesPrice = [{
        weightMin: 0,
        weightMax: 20.0,
        value: '11,90',
        description: `Até 20 Kg cobrar o valor fixo e acima de ${distanceLimit}km cobrar o adicional por KM`
      },
      {
        weightMin: 20.1,
        weightMax: 30.0,
        value: '16,40',
        description: `De 20.1Kg até 30Kg, cobrar o valor fixo e acima de ${distanceLimit}km cobrar o adicional por KM`
      },
      {
        weightMin: 30.1,
        weightMax: 40.0,
        value: '21,00',
        description: `De 30.1Kg até 40Kg, cobrar o valor fixo e acima de ${distanceLimit}km cobrar o adicional por KM`
      },
      {
        weightMin: 40.1,
        weightMax: 50.0,
        value: '25,70',
        description: `De 40.1Kg até 50Kg, cobrar o valor fixo e acima de ${distanceLimit}km cobrar o adicional por KM`
      },
      {
        weightMin: 50.1,
        weightMax: 60.0,
        value: '30,50',
        description: `De 50.1Kg até 60Kg, cobrar o valor fixo e acima de ${distanceLimit}km cobrar o adicional por KM`
      },
      {
        weightMin: 60.1,
        weightMax: 70.0,
        value: '35,40',
        description: `De 60.1Kg até 70Kg, cobrar o valor fixo e acima de ${distanceLimit}km cobrar o adicional por KM`
      },
      ];

      if (!bodyData.weight || !bodyData.distance) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00002', null, 'Informe o peso e a distância'));
      }

      var distance = parseFloat(bodyData.distance);
      var weight = parseFloat(bodyData.weight);

      if (distance == 0) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00002', null, 'Valor da distância inválido'));
      }

      var itemPrice = rolesPrice.find(x => weight <= x.weightMax && weight >= x.weightMin);

      if (!itemPrice) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00002', null, 'Peso acima do habilitado, procure a área comercial'));
      }

      var totalValue = 0;

      if (distance <= distanceLimit) {
        totalValue = itemPrice.value;
      } else {
        let difference = (distance - distanceLimit) * additionalPriceKM;
        let sumDifference = SharedService.realToDecimal(itemPrice.value) + difference;

        totalValue = SharedService.decimalToReal(sumDifference);
      }

      const objReturn = {
        status: 'success',
        result: totalValue
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * POST /order/:idOrder/invoice
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async postOrderInvoice({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    try {

      /** Get and check required fields */
      const {
        idOrder
      } = params;

      let bodyData = request.input('params');

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        paymentMethod,
        tokenCredit,
      } = bodyData;


      if (!request.raw() || !idOrder || !bodyData || (!['pix', 'credit'].includes(paymentMethod))) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      /** Get and check authenticate user */
      let idUser = 0
      if (auth.user) {
        idUser = auth.user.id
      }

      var user = null;

      const authenticateUser = (await Users.query()
        .where('id', idUser)
        .with('address')
        .select('id', 'name', 'fantasyName', 'phone', 'email', 'status', 'profile', 'typeUser', 'cpfcnpj', 'activatedUser')
        .first()).toJSON()

      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      /** Get and check order */
      const existsOrder = (await Orders.query()
        .where('id', idOrder)
        .with('orderInvoice')
        .with('items')
        .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route')
        .first()).toJSON();

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      // if(existsOrder.orderInvoice)  {
      //   response.status(404)
      //   return response.json(ErrorController.error('order', '00012'))
      // }

      /** If user admin, get the user of order */
      if (authenticateUser.profile === 'administrator') {
        user = (await Users.query()
          .where('id', existsOrder.idUser)
          .where('activatedUser', 1)
          .with('address')
          .select('id', 'name', 'fantasyName', 'phone', 'email', 'status', 'profile', 'typeUser', 'cpfcnpj', 'activatedUser')
          .first()).toJSON();
      } else {

        /** Check the authorization order for user */
        if (existsOrder.idUser != authenticateUser.id) {
          response.status(404)
          return response.json(ErrorController.error('order', '00001'))
        }

        user = authenticateUser;
      }

      if (paymentMethod == 'pix') {
        await IuguService.createPix(existsOrder, user);
      } else if (paymentMethod == 'credit') {
        await IuguService.payCreditCard(tokenCredit, existsOrder, user);
      }

      const objReturn = {
        status: 'success',
        message: 'Fatura do pedido cadastrada com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
   * POST /order/:idOrder/refund
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async refundInvoice({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    try {

      /** Get and check required fields */
      const {
        idOrder
      } = params;

      let bodyData = request.input('params');

      if (!bodyData) {
        bodyData = request.post()
      }

      if (!idOrder) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      /** Get and check authenticate user */
      let idUser = 0
      if (auth.user) {
        idUser = auth.user.id
      }

      var user = null;

      const authenticateUser = (await Users.query()
        .where('id', idUser)
        .where('activatedUser', 1)
        .select('id', 'name', 'fantasyName', 'phone', 'email', 'status', 'profile', 'typeUser', 'cpfcnpj', 'activatedUser')
        .first()).toJSON()

      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      /** Get and check order */
      const existsOrder = (await Orders.query()
        .where('id', idOrder)
        .with('orderInvoice')
        .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route')
        .first()).toJSON();

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      /** If user admin, get the user of order */
      if (authenticateUser.profile === 'administrator') {
        user = (await Users.query()
          .where('id', existsOrder.idUser)
          .where('activatedUser', 1)
          .select('id', 'name', 'fantasyName', 'phone', 'email', 'status', 'profile', 'typeUser', 'cpfcnpj', 'activatedUser')
          .first()).toJSON();
      } else {

        /** Check the authorization order for user */
        if (existsOrder.idUser != authenticateUser.id) {
          response.status(404)
          return response.json(ErrorController.error('order', '00001'))
        }

        user = authenticateUser;
      }

      await IuguService.invoiceRefund(existsOrder.orderInvoice.providerPaymentId);

      var iuguStatus = IuguService.getStatus('refunded');
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      await OrderInvoice.query()
        .where('idOrder', existsOrder.id)
        .update({
          status: iuguStatus.status,
          creditCardMessage: iuguStatus.message,
          updated_at: date
        });

      await Orders.query()
        .where('id', existsOrder.id)
        .update({
          status: 'canceled',
          updated_at: date
        });

      const objReturn = {
        status: 'success',
        message: 'Reembolso solicitado com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }

  /**
 * Put /order/verification/code/collect_or_destination
 *
 * @param {object} ctx
 * @param {Auth} ctx.auth
 * @param {Request} ctx.request
 * @param {Response} ctx.response
 */
  async verificationCodeCollectAndDestination({
    ctx,
    auth,
    request,
    response
  }) {
    try {

      if (!request.raw()) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
      }

      let bodyData = request.input('params');

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        type,
        code,
        idOrder,
        idDriver,
      } = bodyData;

      if (![
        'collect',
        'destination'
      ].includes(type)) {
        response.status(401)
        return response.json(ErrorController.error('order', '00013'))
      }

      if (!code || (code && code.length != 6)) {
        response.status(401)
        return response.json(ErrorController.error('order', '00014'))
      }

      if (!idOrder) {
        response.status(401)
        return response.json(ErrorController.error('order', '00011'))
      }

      if (!idDriver) {
        response.status(401)
        return response.json(ErrorController.error('driver', '00003'))
      }

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
        .first()

      if (!existsOrder) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001'))
      }

      let existsVerificationCode = await VerificationCodeCollectAndDestination.query()
        .where('id', idOrder)
        .where('type', type)
        .with('order')
        .first()

      console.log('>> existsVerificationCode', existsVerificationCode);

      console.log('>> Obj', type,
      code,
      idOrder,
      idDriver);

      // /** Get and check authenticate user */
      // let idUser = 0
      // if (auth.user) {
      //   idUser = auth.user.id
      // }

      // var user = null;

      // await Orders.query()
      //   .where('id', existsOrder.id)
      //   .update({
      //     status: 'canceled',
      //     updated_at: date
      //   });

      const objReturn = {
        status: 'success',
        message: 'Código validado com sucesso!',
      }

      response.status(200)
      response.json(objReturn)
    } catch (e) {
      throw e
    }
  }
}

module.exports = OrderController
