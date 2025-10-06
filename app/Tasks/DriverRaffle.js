'use strict'

const Task = use('Task')

// Models
const Orders = use('App/Models/Base/Orders')
const OrderInvoice = use('App/Models/Base/OrderInvoice')
const Users = use('App/Models/Base/Users')

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

const moment = require('moment');

// Discount to inexact  car bagage
const BAGAGE_DISCOUNT = 0.25

class DriverRaffleTask extends Task {
  static get schedule () {
    return '*/6 * * * *'
  }

  async handle () {

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

    if(approvedOrders.length == 0) return;

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
    
    if(listDrivers.length == 0) return this.info({message: `[DriverRaffleTask] don't have a valid driver`});
    
    /**
     * STEP 1
     * validate drivers spaces to order
     */
    approvedOrders.forEach(approvedOrder => {
      if(approvedOrder.items.length == 0) return;
      if(!approvedOrder.orderInvoice) return;

      var validDriverToOrder = {
        order: approvedOrder,
        validDrivers : []
      }

      listDrivers.forEach(itemDriver => {
        let vehicleValid = true;
        if(!itemDriver.deliveryVehicles) return;

        // check if vehicle is valid to order items
        approvedOrder.orderVolume = 0;
        approvedOrder.items.forEach(item => {
          if(!vehicleValid) return;
          vehicleValid = SharedService.isValidSizeToVehicle(itemDriver.deliveryVehicles, item);

          let itemMeasure = SharedService.normalizeMeasure( item );
          approvedOrder.orderVolume += SharedService.getVolume(itemMeasure);
        });

        itemDriver.bagageMeasure = SharedService.normalizeMeasure( itemDriver.deliveryVehicles );
        itemDriver.bagageVolume = SharedService.getVolume(itemDriver.bagageMeasure);
        itemDriver.bagageInUse = 0;
        itemDriver.bagageFree = itemDriver.bagageVolume;

        if(vehicleValid) {

          // check the space in use of driver
          if(itemDriver.driverOrders.length > 0) {
            itemDriver.driverOrders.forEach(driverOrder => {
              if(driverOrder.items.length == 0) return;
              driverOrder.orderVolume = 0;
              driverOrder.items.forEach(item => {
                
                let itemMeasure = SharedService.normalizeMeasure( item );
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
          if( bagageCalc >= approvedOrder.orderVolume ) {
            validDriverToOrder.validDrivers.push(itemDriver);
          }
        }
        
      });

      validDriversToOrder.push(validDriverToOrder);
    });

    /**
     * STEP 2 - Validate the drivers distance
     */

    for (let i = 0; i < validDriversToOrder.length; i++) {
      const orderDriver = validDriversToOrder[i];      
      if(orderDriver.validDrivers.length == 0) {
        this.info({message: `[DriverRaffleTask] don't have a valid driver to order:: ${orderDriver.order.id}`});
        continue;
      }

      var origin  = `${orderDriver.order.orderInformation.withdraw.location.lat},${orderDriver.order.orderInformation.withdraw.location.lng}`;
      var destinations  = ``;

      orderDriver.validDrivers.forEach((driver, idx) => destinations  += `|${idx}_${driver.lat},${driver.lng}`);
      destinations = destinations.substring(1);

      // if has only one driver, set her directly
      // if(orderDriver.validDrivers.length >= 1) {
      if(orderDriver.validDrivers.length == 1) {
        // vincule driver to order
        this.updateOrderDriver(orderDriver.order.id, orderDriver.validDrivers[0].id);
      } else {
        orderDriver.gmapDistance = await SharedService.getGmapDistance(origin, destinations);

        if(orderDriver.gmapDistance.rows.length > 0 && orderDriver.gmapDistance.rows[0].elements && orderDriver.gmapDistance.rows[0].elements.length > 0) {
          var lessDistance = {
            distance: null,
            driver: null
          };
          orderDriver.gmapDistance.rows[0].elements.forEach((element, eidx) => {
            if(!lessDistance.distance.value){
              lessDistance.distance = element.distance;
              lessDistance.driver = orderDriver.validDrivers[eidx];
            } else if(element.distance.value < lessDistance.distance.value) {
              lessDistance.distance = element.distance;
              lessDistance.driver = orderDriver.validDrivers[eidx];
            }
          });

          // vincule driver to order
          this.updateOrderDriver(orderDriver.order.id, lessDistance.driver.id);
        }
      }
      // console.log(orderDriver);
    }

    this.info({message: `[DriverRaffleTask] finished, has found ${validDriversToOrder.length} orders`});
  }
  
  /**
   * Update order driver
   * @param {number} orderId order ID
   * @param {number} driverId driver ID
   */
  async updateOrderDriver(orderId, driverId) {
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    await Orders.query()
    .where('id', orderId)
    .update({
      idDriver: driverId,
      deliveryStatus: '1_attempt',
      updated_at: date
    });
  }
}

module.exports = DriverRaffleTask