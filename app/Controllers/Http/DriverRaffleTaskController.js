'use strict'

// Models
const Orders = use('App/Models/Base/Orders')
const OrderDelivery = use('App/Models/Base/OrderDelivery')
const Users = use('App/Models/Base/Users')

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

// OneSignal
/** @type {import('../../Services/OneSignal')} */
const OneSignal = use('App/Services/OneSignal')

const moment = require('moment');

// Discount to inexact  car bagage
const BAGAGE_DISCOUNT = 0.25

class DriverRaffleTaskController {

  async index() {

    try {

      var approvedOrders = [];
      var listDrivers = [];

      var validDriversToOrder = [];

      approvedOrders = (await Orders.query()
        .where('deliveryStatus', 'pending')
        .where('status', 'execution')
        .whereNull('idDriver')
        .with('orderInformation')
        .with('items')

        .with('orderInvoice', oi => {
          oi.where('status', 'approve')
          oi.select('id', 'method', 'value', 'idOrder', 'idUser', 'providerPaymentId', 'providerCustomerId', 'status')
        })
        .orderBy('created_at', 'asc')
        .fetch()).toJSON();

      SharedService.log(`[DriverRaffleTask] Starting, find ${approvedOrders.length} valid orders`);

      if (approvedOrders.length == 0) return;

      listDrivers = (await Users.query()
        .where('online', 1)
        .where('profile', 'driver')
        .where('typeUser', 'driver')
        .where('documentsValidated', 'validDriver')
        .where('activatedUser', 1)
        .whereNotNull('lat')
        .whereNotNull('lng')
        .with('deliveryVehicles')
        .with('driverOrders', driverOrder => { driverOrder.with('items') })
        .fetch()).toJSON();

      if (listDrivers.length == 0) return SharedService.log(`[DriverRaffleTask] don't have a valid driver`);

      /**
       * STEP 1
       * validate drivers spaces to order and if don't reject delivery
       */
      for (let a = 0; a < approvedOrders.length; a++) {
        const approvedOrder = approvedOrders[a];

        if (approvedOrder.items.length == 0) continue;
        if (!approvedOrder.orderInvoice) continue;

        var validDriverToOrder = {
          order: approvedOrder,
          validDrivers: []
        }

        for (let i = 0; i < listDrivers.length; i++) {
          const itemDriver = listDrivers[i];
          let vehicleValid = true;
          // SharedService.log(`itemDriver.deliveryVehicles`)
          // SharedService.log(itemDriver.deliveryVehicles)
          if (!itemDriver.deliveryVehicles) continue;

          const driverHasRejectDelivery = await this.driverHasRejectDelivery(approvedOrder.id, itemDriver.id)
          if (driverHasRejectDelivery) continue;

          // check if vehicle is valid to order items
          approvedOrder.orderVolume = 0;
          approvedOrder.items.forEach(item => {
            if (!vehicleValid) return;
            vehicleValid = SharedService.isValidSizeToVehicle(itemDriver.deliveryVehicles, item);

            let itemMeasure = SharedService.normalizeMeasure(item);
            approvedOrder.orderVolume += SharedService.getVolume(itemMeasure);
          });

          SharedService.log(`vehicleValid ${vehicleValid}`);
          SharedService.log(`approvedOrder.orderVolume ${approvedOrder.orderVolume}`);
          // SharedService.log(`approvedOrder.items ${approvedOrder.items}`);
          // SharedService.log(approvedOrder.items);

          itemDriver.bagageMeasure = SharedService.normalizeMeasure(itemDriver.deliveryVehicles);
          itemDriver.bagageVolume = SharedService.getVolume(itemDriver.bagageMeasure);
          itemDriver.bagageInUse = 0;
          itemDriver.bagageFree = itemDriver.bagageVolume;

          SharedService.log(`itemDriver.bagageFree ${itemDriver.bagageFree}`);

          if (vehicleValid) {

            // check the space in use of driver
            if (itemDriver.driverOrders.length > 0) {
              itemDriver.driverOrders.forEach(driverOrder => {
                if (driverOrder.items.length == 0) return;
                driverOrder.orderVolume = 0;
                driverOrder.items.forEach(item => {

                  let itemMeasure = SharedService.normalizeMeasure(item);
                  driverOrder.orderVolume += SharedService.getVolume(itemMeasure)
                });

                itemDriver.bagageInUse += driverOrder.orderVolume;
                itemDriver.bagageFree -= driverOrder.orderVolume;
              });
            }

            /**
             * discount percent of value because irregular spaces in vehicle bagage
             * after check if has valide space
             */
            let bagageCalc = (itemDriver.bagageVolume - (itemDriver.bagageVolume * BAGAGE_DISCOUNT)) - itemDriver.bagageInUse;
            if (bagageCalc >= approvedOrder.orderVolume) {
              validDriverToOrder.validDrivers.push(itemDriver);
            }
          }

        }

        validDriversToOrder.push(validDriverToOrder);
      }

      /**
       * STEP 2 - Validate the drivers distance
       */

      for (let i = 0; i < validDriversToOrder.length; i++) {
        const orderDriver = validDriversToOrder[i];
        if (orderDriver.validDrivers.length == 0) {
          SharedService.log(`[DriverRaffleTask] don't have a valid driver to order:: ${orderDriver.order.id}`);
          continue;
        }

        var origin = `${orderDriver.order.orderInformation.withdraw.location.lat},${orderDriver.order.orderInformation.withdraw.location.lng}`;
        var destinations = ``;

        orderDriver.validDrivers.forEach((driver, idx) => destinations += `|${driver.lat},${driver.lng}`);
        destinations = destinations.substring(1);

        // if has only one driver, set her directly
        // if(orderDriver.validDrivers.length >= 1) {
        // if (orderDriver.validDrivers.length == 1) {
        //   // vincule driver to order
        //   this.updateOrderDriver(orderDriver.order.id, orderDriver.validDrivers[0].id);
        // } else 
        {
          orderDriver.gmapDistance = await SharedService.getGmapDistance(origin, destinations);

          if (orderDriver.gmapDistance.rows.length > 0 && orderDriver.gmapDistance.rows[0].elements && orderDriver.gmapDistance.rows[0].elements.length > 0) {
            var lessDistance = {
              distance: null,
              driver: null
            };

            orderDriver.gmapDistance.rows[0].elements.forEach((element, eidx) => {
              if (element.distance.value >= 10000) return;

              if (!lessDistance.distance) {
                lessDistance.distance = element.distance;
                lessDistance.driver = orderDriver.validDrivers[eidx];
              } else if (element.distance.value < lessDistance.distance.value) {
                lessDistance.distance = element.distance;
                lessDistance.driver = orderDriver.validDrivers[eidx];
              }
            });

            // vincule driver to order
            if (lessDistance.driver && lessDistance.driver.id) this.updateOrderDriver(orderDriver.order.id, lessDistance.driver.id, lessDistance.driver.onesignal_player_id);
          }
        }
        // console.log(orderDriver);
      }
    } catch (error) {
      SharedService.log(error);
    }

    SharedService.log(`[DriverRaffleTask] finished, has found ${validDriversToOrder.length} orders`);
    return true;
  }

  /**
   * Update order driver
   * @param {number} orderId order ID
   * @param {number} driverId driver ID
   * @param {number} onesignalPlayerId onesignal player ID
   */
  async updateOrderDriver(orderId, driverId, onesignalPlayerId) {

    try {
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      await Orders.query()
        .where('id', orderId)
        .update({
          idDriver: driverId,
          deliveryStatus: 'pending',
          updated_at: date
        });

      await OrderDelivery.create({
        idOrder: orderId,
        idDriver: driverId,
        deliveryStatus: 'pending',
        eventDate: date,
        created_at: date,
        updated_at: date
      });

      this.sendPushNotification(
        'Novo pedido para você', //Titulo
        'Você recebeu um novo pedido, entre no app e saiba mais', //Sub Titulo
        'sameday://home', // essa string é um deep link, é pra forcar a abertura da notificacao na tela home do app 
        [onesignalPlayerId], //[pegar onesignal player id do motorista selecionado na tabela (passar como array)],
        { "notificationType": 'confirmation', "orderId": orderId }, //parametros para ser enviado ao app
      )

    } catch (error) {
      SharedService.log(error);
    }
  }

  /**
   * Check if driver has reject delivery
   * @param {number} idOrder Order ID
   * @param {number} idDriver Driver ID
   * @returns {boolean}
   */
  async driverHasRejectDelivery(idOrder, idDriver) {
    try {
      var hasReject = await OrderDelivery.query()
        .where('idOrder', idOrder)
        .where('idDriver', idDriver)
        .where('deliveryStatus', 'rejectDelivery')
        .first()

      return hasReject != null;

    } catch (error) {
      SharedService.log(error);
    }

  }

  sendPushNotification(title, message, url, arrayPlayerId, data) {

    SharedService.log(arrayPlayerId)
    SharedService.log(data)
    SharedService.log(url)
    SharedService.log(message)
    SharedService.log(title)

    const notification = {
      contents: { 'en': title },
      subtitle: { 'en': message },
      url,
      include_player_ids: arrayPlayerId,
      data
    }

    OneSignal.sendNotification(notification)
  }

}

/**
 *  Usar esse código para enviar notificação para o app
 *  OneSignal.sendPushNotification(
      'Novo pedido para você', Titulo
      'Você recebeu um novo pedido, entre no app e saiba mais', Sub Titulo
      'sameday://home', essa string é um deep link, é pra forcar a abertura da notificacao na tela home do app 
      [pegar onesignal player id do motorista selecionado na tabela (passar como array)],
      { "notificationType": 'confirmation', "orderId": id do pedido aqui }, parametros para ser enviado ao app
    )
 * 
 * 
*/

module.exports = DriverRaffleTaskController