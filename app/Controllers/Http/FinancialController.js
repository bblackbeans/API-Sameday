'use strict'

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

// Models
const Orders = use('App/Models/Base/Orders')
const Users = use('App/Models/Base/Users')
const DriverInvoice = use('App/Models/Base/DriverInvoice')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')
/** @type {import('../SharedController')} */
const SharedController = make('App/Controllers/Http/SharedController')

const DRIVER_SERVICE_TAX = 0.75;

class FinancialController { 

  /**
   * GET /financial/resume
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getResumeReport({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    
    /** Get and check required fields */
    const {
      createdAtGte,
      createdAtLte,
      monthReference,
    } = request.get();

    var dataReturn = {
      cards: {
        ordersQtd: 0,
        orderTotal: 0,
        receivedAmount: 0,
        diffLastMonth: {
          icon: '',
          value: 0
        },
      },
      chartData:null,
      listDrivers: []
    }

    var currentDate = new Date();

    try {

      if(!monthReference && (!createdAtGte && !createdAtLte) ) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('error', '00005', null))
      }

      var dateStr = `${new Date().getFullYear()}-01-01 00:00:00`;

      var listAllOrders = (await Orders.query()
      .where('deliveryStatus','delivered')
      .where('status','finished')
      .where('created_at', '>=', dateStr)
      .select('id', 'price', 'created_at', 'idDriver', 'updated_at')
      .fetch()).toJSON();

      var listSearchedOrders = [];
      // monthReference
      if(monthReference) {

        let splitMonthRef = monthReference.split('/');
        currentDate = new Date(splitMonthRef[1], (parseInt(splitMonthRef[0]) - 1), 1, 0, 0, 0);

        var driverInvoices = (await DriverInvoice.query()
        .where('reference', monthReference)
        .fetch()).toJSON();

        var listIdDriverInvoice = [];
        driverInvoices.map(x => listIdDriverInvoice.push(x.id));

        if(listIdDriverInvoice.length > 0) {
          listSearchedOrders = (await Orders.query()
          .whereIn('idDriverInvoice', listIdDriverInvoice)
          .with('userDriver')
          .fetch()).toJSON();
        }

      }else if(createdAtGte && createdAtLte) {
        listSearchedOrders = (await Orders.query() 
        .where('deliveryStatus','delivered')
        .where('status','finished')
        .whereNotNull('idDriverInvoice')
        .whereBetween('created_at', [ new Date(createdAtGte), new Date(createdAtLte) ])
        .with('userDriver')
        .fetch()).toJSON();
      } else {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      dataReturn.cards.ordersQtd = listSearchedOrders.length;

      // pegar mes atual para verificar na busca
      var tmpListDrivers = new Map();
      listSearchedOrders.forEach(order => {


        var objList = tmpListDrivers.get(order.userDriver.cpfcnpj) ;

        objList = objList ? objList : {
          driverId: order.userDriver.id,
          driverName: order.userDriver.name,
          driverMail: order.userDriver.email,
          driverPhone: order.userDriver.phone,
          driverDocument: order.userDriver.cpfcnpj,
          qtdOrders: 0,
          idOrder: order.id,
          totalValue: 0,
          totalKms: 0,
          totalOrdersTime: 0
        }

        let price = SharedService.realToDecimal(order.price);
        dataReturn.cards.orderTotal += price;

        let amountDriver = ( price * DRIVER_SERVICE_TAX );
        let amountOrder = price  - amountDriver;
        dataReturn.cards.receivedAmount += amountOrder;

        objList.qtdOrders++;
        objList.totalValue += amountDriver;
        objList.totalKms += SharedService.realToDecimal(order.km.replace(/[aA-zZ ]/gi, ''));
        objList.totalOrdersTime += SharedService.realToDecimal(order.duration.replace(/[aA-zZ ]/gi, ''));

        tmpListDrivers.set(objList.driverDocument, objList);
      });

      dataReturn.listDrivers = Array.from(tmpListDrivers.values());
      dataReturn.listDrivers.forEach(item => {
        item.totalValue =  SharedService.decimalToReal(item.totalValue);
        item.totalKms =  SharedService.decimalToReal(item.totalKms);
      });

      dataReturn.cards.orderTotal = SharedService.decimalToReal(dataReturn.cards.orderTotal);
      dataReturn.cards.receivedAmount = SharedService.decimalToReal(dataReturn.cards.receivedAmount);
      // dataReturn.cards.diffLastMonth = SharedService.decimalToReal(dataReturn.cards.diffLastMonth);

      /**
       * Prepare chart data
       */
      
      var currentMonth = currentDate.getMonth() + 1;
      var currentMonthStr = `${ SharedService.padStr( currentMonth ) }/${currentDate.getFullYear()}`;
      var lastMonthStr = currentMonth == 1 ? `12/${currentDate.getFullYear() - 1}` : `${ SharedService.padStr(currentDate.getMonth()) }/${currentDate.getFullYear()}`;

      var diffLastMonth = { lastMonth: { text: lastMonthStr, value: 0 }, currentMonth: { text: currentMonthStr, value: 0 }, diff: 0 };

      var chartValue = new Map();
      var chartLabels = [];
      var chartLineValues = [];

      listAllOrders.forEach(order => {

        let orderDate = new Date(order.created_at);
        let orderMonthRef = `${ SharedService.padStr( orderDate.getMonth() + 1 ) }/${orderDate.getFullYear()}`;

        let item = chartValue.get(orderMonthRef);
        let price = SharedService.realToDecimal(order.price);
        let amountDriver = ( price * DRIVER_SERVICE_TAX );
        let amountOrder = price  - amountDriver;

        amountOrder = parseFloat( amountOrder.toFixed(2) );

        if(item) {
          item += amountOrder
          chartValue.set(orderMonthRef, item)
        } else {
          chartValue.set(orderMonthRef, amountOrder)
        }
      });

      for (let i = 1; i <= 12; i++) {
        let orderMonthRef = `${ SharedService.padStr( i ) }/${currentDate.getFullYear()}`;

        let item = chartValue.get(orderMonthRef);
        if(!item) chartValue.set(orderMonthRef, 0);

        let value = item ? item : 0;

        if(orderMonthRef == lastMonthStr) diffLastMonth.lastMonth.value = value;
        if(orderMonthRef == currentMonthStr) diffLastMonth.currentMonth.value = value;

        chartLabels.push(orderMonthRef);
        chartLineValues.push(value);
      }

      if(diffLastMonth.currentMonth.value != 0) {
        let lastValue = diffLastMonth.lastMonth.value == 0 ? 1 :diffLastMonth.lastMonth.value;
        let currentValue = diffLastMonth.currentMonth.value;

        let value = currentValue - lastValue;
        let percentage = 0;
        if(value < 0) {
          value = value * -1;
          percentage = (value * 100) / currentValue;
          dataReturn.cards.diffLastMonth.value = `-${SharedService.decimalToReal(percentage)}%`;
          dataReturn.cards.diffLastMonth.icon = `down`;
        } else if (value > 0) {
          percentage = (value * 100) / lastValue;
          dataReturn.cards.diffLastMonth.value = `+${SharedService.decimalToReal(percentage)}%`;
          dataReturn.cards.diffLastMonth.icon = `up`;
        }
      } else {
        dataReturn.cards.diffLastMonth.value = `00,00%`;
      }

      dataReturn.chartData = { labels: chartLabels, data: chartLineValues }

    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: '',
      data: dataReturn
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * GET /financial/driver-ranking
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getDriverRankReport({
    ctx,
    auth,
    params,
    request,
    response
  }){

    /** Get and check required fields */
    const {
      createdAtGte,
      createdAtLte,
      monthReference,
    } = request.get();

    var dataReturn = {
      listDrivers: []
    }

    var currentDate = new Date();

    try {
      
      if(!monthReference && (!createdAtGte && !createdAtLte) ) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('error', '00005', null))
      }

      var listSearchedOrders = [];
      // monthReference
      if(monthReference) {

        let splitMonthRef = monthReference.split('/');
        currentDate = new Date(splitMonthRef[1], (parseInt(splitMonthRef[0]) - 1), 1, 0, 0, 0);

        var driverInvoices = (await DriverInvoice.query()
        .where('reference', monthReference)
        .fetch()).toJSON();

        var listIdDriverInvoice = [];
        driverInvoices.map(x => listIdDriverInvoice.push(x.id));

        if(listIdDriverInvoice.length > 0) {
          listSearchedOrders = (await Orders.query()
          .whereIn('idDriverInvoice', listIdDriverInvoice)
          .with('userDriver')
          .fetch()).toJSON();
        }

      }else if(createdAtGte && createdAtLte) {
        listSearchedOrders = (await Orders.query() 
        .where('deliveryStatus','delivered')
        .where('status','finished')
        .whereNotNull('idDriverInvoice')
        .whereBetween('created_at', [ new Date(createdAtGte), new Date(createdAtLte) ])
        .with('userDriver')
        .fetch()).toJSON();
      } else {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      // pegar mes atual para verificar na busca
      var tmpListDrivers = new Map();
      listSearchedOrders.forEach(order => {

        var objList = tmpListDrivers.get(order.userDriver.cpfcnpj) ;

        objList = objList ? objList : {
          driverId: order.userDriver.id,
          driverName: order.userDriver.name,
          driverMail: order.userDriver.email,
          driverPhone: order.userDriver.phone,
          driverDocument: order.userDriver.cpfcnpj,
          qtdOrders: 0,
          idOrder: order.id,
          totalKms: 0,
          totalOrdersTime: 0,
          totalTimeDelivery: 0
        }


        objList.qtdOrders++;
        objList.totalKms += SharedService.realToDecimal(order.km.replace(/[aA-zZ ]/gi, ''));
        objList.totalOrdersTime += SharedService.realToDecimal(order.duration.replace(/[aA-zZ ]/gi, ''));

        objList.totalTimeDelivery += SharedService.diffHours( new Date(order.created_at), new Date(order.updated_at) );

        objList.totalOrdersTime += SharedService.realToDecimal(order.duration.replace(/[aA-zZ ]/gi, ''));

        tmpListDrivers.set(objList.driverDocument, objList);
      });

      dataReturn.listDrivers = Array.from(tmpListDrivers.values());
      dataReturn.listDrivers.forEach(item => {
        item.totalKms =  SharedService.decimalToReal(item.totalKms);
      });

      dataReturn.listDrivers.sort((a,b) => a.qtdOrders - b.qtdOrders);

    } catch (error) {
      SharedService.log(error);      
    }

    const objReturn = {
      status: 'success',
      message: '',
      data: dataReturn
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * GET /financial/admin-invoice
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getAdminInvoiceReport({
    ctx,
    auth,
    params,
    request,
    response
  }){

    /** Get and check required fields */
    const {
      createdAtGte,
      createdAtLte,
      monthReference,
    } = request.get();

    var dataReturn = {
      listDrivers: []
    }

    try {
      
      if(!monthReference && (!createdAtGte && !createdAtLte) ) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "administrator") {
        response.status(404)
        return response.json(ErrorController.error('error', '00005', null))
      }

      var driverInvoices = [];
      // monthReference
      if(monthReference) {

        driverInvoices = (await DriverInvoice.query()
        .where('reference', monthReference)
        .with('driver')
        .with('orders')
        .fetch()).toJSON();

      } else {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      // pegar mes atual para verificar na busca
      var tmpListDrivers = new Map();
      driverInvoices.forEach(invoice => {

        var objList = tmpListDrivers.get(invoice.driver.cpfcnpj) ;

        objList = objList ? objList : {
          driverId: invoice.driver.id,
          driverName: invoice.driver.name,
          driverMail: invoice.driver.email,
          driverPhone: invoice.driver.phone,
          driverDocument: invoice.driver.cpfcnpj,
          qtdOrders: invoice.orders.length,
          invoicePaymentStatus: invoice.paymentStatus,
          totalKms: 0,
          totalValue: 0,
          totalOrdersTime: 0,
          totalTimeDelivery: 0
        }

        invoice.orders.forEach(order => {
          
          let price = SharedService.realToDecimal(order.price);
          let amountDriver = ( price * DRIVER_SERVICE_TAX );
          let amountOrder = price  - amountDriver;
  
          objList.totalKms += SharedService.realToDecimal(order.km.replace(/[aA-zZ ]/gi, ''));
          objList.totalOrdersTime += SharedService.realToDecimal(order.duration.replace(/[aA-zZ ]/gi, ''));
          objList.totalValue += amountDriver;
        });

        tmpListDrivers.set(objList.driverDocument, objList);
        
      });

      dataReturn.listDrivers = Array.from(tmpListDrivers.values());
      dataReturn.listDrivers.forEach(item => {
        item.totalValue =  SharedService.decimalToReal(item.totalValue);
        item.totalKms =  SharedService.decimalToReal(item.totalKms);
      });

    } catch (error) {
      SharedService.log(error);      
    }

    const objReturn = {
      status: 'success',
      message: '',
      data: dataReturn
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * GET /financial/driver-payment
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async getDriverPaymentReport({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    
    /** Get and check required fields */
    const {
      createdAtGte,
      createdAtLte,
      monthReference,
    } = request.get();

    var dataReturn = {
      listOrders: []
    }

    var currentDate = new Date();

    try {

      if(!monthReference && (!createdAtGte && !createdAtLte) ) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "administrator" && authenticateUser.profile != "driver") {
        response.status(404)
        return response.json(ErrorController.error('error', '00005', null))
      }


      var listSearchedOrders = [];
      // monthReference
      if(monthReference) {

        let splitMonthRef = monthReference.split('/');
        currentDate = new Date(splitMonthRef[1], (parseInt(splitMonthRef[0]) - 1), 1, 0, 0, 0);

        var driverInvoices = (await DriverInvoice.query()
        .where('reference', monthReference)
        .fetch()).toJSON();

        var listIdDriverInvoice = [];
        driverInvoices.map(x => listIdDriverInvoice.push(x.id));

        if(listIdDriverInvoice.length > 0) {
          listSearchedOrders = (await Orders.query()
          .whereIn('idDriverInvoice', listIdDriverInvoice)
          .where('idDriver', authenticateUser.id)
          .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route')
          // .with('userDriver')
          .fetch()).toJSON();
        }

      }else if(createdAtGte && createdAtLte) {
        listSearchedOrders = (await Orders.query() 
        .where('deliveryStatus','delivered')
        .where('status','finished')
        .whereNotNull('idDriverInvoice')
        .where('idDriver', authenticateUser.id)
        .whereBetween('created_at', [ new Date(createdAtGte), new Date(createdAtLte) ])
        .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route')
        // .with('userDriver')
        .fetch()).toJSON();
      } else {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

    } catch (error) {
      SharedService.log(error);
    }

    var totalOrdersSum = 0;

    listSearchedOrders.forEach(order => {
      let price = SharedService.realToDecimal(order.price);
      totalOrdersSum += price;
    });

    const objReturn = {
      status: 'success',
      message: '',
      data: SharedService.decimalToReal(totalOrdersSum)
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * GET /financial/driver-resume
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async getDriverResumeReport({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    
    /** Get and check required fields */
    const {
      createdAtGte,
      createdAtLte,
      monthReference,
    } = request.get();

    var dataReturn = {
      listOrders: []
    }

    var currentDate = new Date();

    try {

      if(!monthReference && (!createdAtGte && !createdAtLte) ) {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

      /** Get and check authenticate user */
      const authenticateUser = await SharedController.getAuthenticateUser(auth);
      if (!authenticateUser) {
        response.status(404)
        return response.json(ErrorController.error('user', '00001', null))
      }

      if(authenticateUser.profile != "administrator" && authenticateUser.profile != "driver") {
        response.status(404)
        return response.json(ErrorController.error('error', '00005', null))
      }


      var listSearchedOrders = [];
      // monthReference
      if(monthReference) {

        let splitMonthRef = monthReference.split('/');
        currentDate = new Date(splitMonthRef[1], (parseInt(splitMonthRef[0]) - 1), 1, 0, 0, 0);

        var driverInvoices = (await DriverInvoice.query()
        .where('reference', monthReference)
        .fetch()).toJSON();

        var listIdDriverInvoice = [];
        driverInvoices.map(x => listIdDriverInvoice.push(x.id));

        if(listIdDriverInvoice.length > 0) {
          listSearchedOrders = (await Orders.query()
          .whereIn('idDriverInvoice', listIdDriverInvoice)
          .where('idDriver', authenticateUser.id)
          .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route', 'created_at')
          // .with('userDriver')
          .fetch()).toJSON();
        }

      }else if(createdAtGte && createdAtLte) {
        listSearchedOrders = (await Orders.query() 
        .where('deliveryStatus','delivered')
        .where('status','finished')
        .whereNotNull('idDriverInvoice')
        .where('idDriver', authenticateUser.id)
        .whereBetween('created_at', [ new Date(createdAtGte), new Date(createdAtLte) ])
        .select('id', 'idUser', 'idDriver', 'status', 'deliveryStatus', 'messageToDriver', 'duration', 'km', 'price', 'route', 'created_at')
        // .with('userDriver')
        .fetch()).toJSON();
      } else {
        response.status(400)
        return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'));
      }

    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: '',
      data: listSearchedOrders
    }

    response.status(200)
    response.json(objReturn)
  }

}

module.exports = FinancialController