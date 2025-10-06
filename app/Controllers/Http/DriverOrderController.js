'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const OrderDelivery = use('App/Models/Base/OrderDelivery')
const Orders = use('App/Models/Base/Orders')
const Users = use('App/Models/Base/Users')
const DriverInvoice = use('App/Models/Base/DriverInvoice')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')
/** @type {import('../SharedController')} */
const SharedController = make('App/Controllers/Http/SharedController')

// Services
/** @type {import('./../../Services/SendSms')} */
const SendSms = use('App/Services/SendSms')
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

const moment = require('moment')
const Shared = require('../../Services/Shared')

const MINUTES_TO_CONFIRM = 5;

class DriverOrderController { 

  /**
   * GET /driver-order/:idDriver/orders
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getDriverOrders({
    ctx,
    auth,
    params,
    request,
    response
  }) {

      /** Get and check required fields */
      const {
        idDriver
      } = params;

      let bodyData = request.input('params');

      if(!idDriver) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "driver") {
        response.status(404)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      /** Get and check order */
      const orders = (await Orders.query()
        .select('id', 'status', 'deliveryStatus', 'duration', 'km', 'price', 'created_at', 'route')
        .where('idDriver', idDriver)
        .where('deliveryStatus', 'pending')
        .with('items')
        .with('orderInformation')
        .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route')
        .fetch()).toJSON();

      return orders;
  }

  /**
   * PUT /driver-order/:idOrder/confirm/:confirm
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async putConfirmDelivery({
    ctx,
    auth,
    params,
    request,
    response
  }) {

      /** Get and check required fields */
      const {
        idOrder,
        confirm
      } = params;

      // if(!idOrder || (confirm != 0 && confirm != 1)) {
      //   response.status(400)
      //   return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      // }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "driver" && authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      const date = moment().format('YYYY-MM-DD HH:mm:ss');

      var order = await Orders.query()
        .where('id', idOrder)
        .whereIn('status', ['execution', 'pending'])
        .with('orderInformation')
        .first();

      if (!order) {
        response.status(404)
        return response.json(ErrorController.error('parameters', '00002', null))
      } 

      try {
        // reject
        if (confirm == 0) {

          await Orders.query()
            .where('id', idOrder)
            .update({
              idDriver: null,
              deliveryStatus: 'pending',
              updated_at: date
            });

          await OrderDelivery.create({
            idOrder: idOrder,
            idDriver: authenticateUser.id,
            deliveryStatus: 'rejectDelivery',
            eventDate: date,
            created_at: date,
            updated_at: date
          });
        // confirm  
        } else {

          // //check the time of confirmation
          // var orderDelivery = await OrderDelivery.query()
          //       .where('idOrder', idOrder)
          //       .where('idDriver', authenticateUser.id)
          //       .where('deliveryStatus', 'pending')
          //       .first();

          // if(!orderDelivery) {
          //   response.status(404)
          //   return response.json(ErrorController.error('order', '00001', null))
          // }

          // var currentDate = new Date();
          // var checkStatusDate = new Date(orderDelivery.created_at);
          // checkStatusDate.setMinutes(checkStatusDate.getMinutes() + MINUTES_TO_CONFIRM);
          
          // if(currentDate  > checkStatusDate){
          //   response.status(404)
          //   return response.json(ErrorController.error('driver', '00002', null))
          // }

          // // find or create the driver invoice
          // var reference = Shared.getDateTimeNow().substring(3,10).trim();
          // var driverInvoice = await DriverInvoice.query()
          //     .where('reference', reference)
          //     .where('idDriver', authenticateUser.id)
          //     .first();

          // if (!driverInvoice) {
          //   driverInvoice = await DriverInvoice.create({
          //     reference: reference,
          //     orderStatus: 'payed',
          //     paymentStatus: 'waiting',
          //     idDriver: authenticateUser.id,
          //     created_at: date,
          //     updated_at: date
          //   });
          // }

          // await Orders.query()
          //   .where('id', idOrder)
          //   .update({
          //     status: 'execution',
          //     deliveryStatus: 'pending',
          //     idDriver: authenticateUser.id,
          //     idDriverInvoice: driverInvoice.id,
          //     updated_at: date
          //   });

          // await OrderDelivery.create({
          //   idOrder: idOrder,
          //   idDriver: authenticateUser.id,
          //   deliveryStatus: 'confirmDelivery',
          //   eventDate: date,
          //   success: true,
          //   created_at: date,
          //   updated_at: date
          // });

          console.log('>> order', order);

          // await SendSms.sendSMS(user.id, user.phone, 'SameDay: Ninguém da Same Day vai te pedir este dado. Não o compartilhe! Seu código de segurança e: ' + code)
        } 
      } catch (error) {
        SharedService.log(error);        
      }

      let status = confirm == 0 ? 'rejected' : 'confirmed'
      const objReturn = {
        status: 'success',
        message: `Driver order has ${status}`
      }
  
      response.status(200)
      response.json(objReturn)
  }

  /**
   * GET /driver-order/:idOrder/status
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getOrderDeliveryStatus({
    ctx,
    auth,
    params,
    request,
    response
  }) {


    /** Get and check required fields */
    const {
      idOrder
    } = params;

    if(!idOrder) {
      response.status(400)
      return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
    }

    try {
      
      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (authenticateUser.profile != "driver" && authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      let orderDeliver = await Orders.query()
      .where('id', idOrder)
      .where('idDriver', authenticateUser.id)
      .where('status', 'execution')
      .select('id', 'status')
      .first();

      if(authenticateUser.profile == "driver" && !orderDeliver) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001', null))
      }

      var list = (await OrderDelivery.query()
      .where('idOrder', idOrder)
      .orderBy('id', 'desc')
      .fetch()).toJSON();

      const objReturn = {
        status: 'success',
        message: `Delivery order status`,
        data: list
      }

      response.status(200)
      response.json(objReturn)
      
    } catch (error) {
      SharedService.log(error);
    }
  }

  /**
   * POST /driver-order/delivery
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async postOrderDelivery({
    ctx,
    auth,
    params,
    request,
    response
  }) {


    if (!request.raw()) {
      response.status(400)
      return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
    }

    let bodyData = request.input('params')

    if (!bodyData) {
      bodyData = request.post()
    }

    /** Get and check authenticate user */
    const authenticateUser = await SharedController.getAuthenticateUser(auth);
    if (!authenticateUser) {
      response.status(404)
      return response.json(ErrorController.error('user', '00001', null))
    }

    if (authenticateUser.profile != "driver" && authenticateUser.profile != "administrator") {
      response.status(404)
      return response.json(ErrorController.error('driver', '00001', null))
    }

    const {
      idOrder,
      idDriver,
      deliveryStatus,
      deliveryFailStatus,
      eventDate,
    } = bodyData

    try {
      
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      const valueEventDate = moment(eventDate).format('YYYY-MM-DD HH:mm:ss');

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if (authenticateUser.profile != "driver" && authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      let orderDeliver = await Orders.query()
      .where('id', idOrder)
      .where('idDriver', idDriver)
      .where('status', 'execution')
      .select('id', 'status')
      .first();

      if(!orderDeliver) {
        response.status(404)
        return response.json(ErrorController.error('order', '00001', null))
      }

      if(deliveryStatus == 'deliveryFail' && !deliveryFailStatus) {
        response.status(404)
        return response.json(ErrorController.error('parameters', '00004', null))
      }

      if(deliveryStatus == 'delivered') {
        await Orders.query()
            .where('id', idOrder)
            .update({
              status: 'finished',
              deliveryStatus: 'delivered',
              updated_at: date
            });
      }

      if(deliveryStatus == 'returnToDestination') {
        await Orders.query()
            .where('id', idOrder)
            .update({
              status: 'finished',
              deliveryStatus: 'returnToStore',
              updated_at: date
            });
      }

      await OrderDelivery.create({
        idOrder: idOrder,
        idDriver: idDriver,
        deliveryStatus: deliveryStatus,
        deliveryFailStatus: deliveryFailStatus,
        eventDate: valueEventDate,
        success: true,
        created_at: date,
        updated_at: date
      });
      
    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: `Delivery order save`
    }

    response.status(200)
    response.json(objReturn)
  }


  /**
   * GET /driver-order/delivery-status
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async getDeliveryStatus({
    ctx,
    auth,
    params,
    request,
    response
  }) {

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "driver" && authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      return [
        { status: 'pending', message: 'Pendente' },
        { status: 'delivered', message: 'Entregue' },
        { status: 'rejectDelivery', message: 'Motorista não aceitou a entrega' },
        { status: 'confirmDelivery', message: 'Motorista aceitou entrega' },
        { status: 'attemptDelivery', message: 'Tentativa de entrega' },
        { status: 'deliveryFail', message: 'Falha na entrega' },
        { status: 'returnToDestination', message: 'Entrega devolvida ao destinatario' },
      ];
  }

  /**
   * GET /driver-order/delivery-fail-status
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async getDeliveryFailStatus({
    ctx,
    auth,
    params,
    request,
    response
  }) {

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "driver" && authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('driver', '00001', null))
      }

      return [
        { status: "mudou_se", message: "Mudou-se" },
        { status: "desconhecido", message: "Desconhecido" },
        { status: "ausente", message: "Ausente" },
        { status: "end_insuficiente", message: "Endereço insuficiente" },
        { status: "recusado", message: "Recusado" },
        { status: "falecido", message: "Falecido" },
        { status: "nao_existe_numero_indicado", message: "Não existe o número indicado" },
        { status: "nao_procurado", message: "Não procurado" },
        { status: "outros", message: "Outros" },
      ];
  }

}

module.exports = DriverOrderController