'use strict'

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

/** @type {import('../DriverRaffleTaskController')} */
const DriverRaffleTaskController = make('App/Controllers/Http/DriverRaffleTaskController')
/** @type {import('../IuguInvoiceStatusTaskController')} */
const IuguInvoiceStatusTaskController = make('App/Controllers/Http/IuguInvoiceStatusTaskController')

class ScheduleController { 

  /**
   * GET /schedule/start
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  start({
    request,
    response
  }) {
    const APP_DEVELOPMENT = process.env.APP_DEVELOPMENT;
    var cron = require('node-cron');


    cron.schedule('*/20 * * * * *', async function () {
      await DriverRaffleTaskController.index();
    });

    cron.schedule('* * * * *', async function () {
      await IuguInvoiceStatusTaskController.index();
    });

    SharedService.log(`Starting cron`);
    
    const objReturn = {
      status: 'success',
      message: 'Schedule has started'
    }

    response.status(200)
    response.json(objReturn)
  }

}

module.exports = ScheduleController