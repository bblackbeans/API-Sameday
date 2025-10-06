'use strict'

const Task = use('Task')

// Models
const Orders = use('App/Models/Base/Orders')
const OrderInvoice = use('App/Models/Base/OrderInvoice')

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')
/** @type {import('../../Services/Iugu')} */
const IuguService = use('App/Services/Iugu')

const moment = require('moment')

class IuguInvoiceStatusTask extends Task {
  static get schedule () {
    return '*/1 * * * *'
  }

  async handle () {

    var pendentOrders = [];
    
    pendentOrders = (await OrderInvoice.query()
    .where('method', 'pix')
    .where('status', 'pending')
    .select('id', 'method', 'value', 'idOrder', 'idUser', 'providerPaymentId', 'providerCustomerId', 'status')
    .orderBy('created_at', 'desc')
    .fetch()).toJSON();

    if(pendentOrders.length == 0) return;

    for (let i = 0; i < pendentOrders.length; i++) {
      const order = pendentOrders[i];

      try {
        var iuguInvoice = await IuguService.getInvoice(order.providerPaymentId);
        var iuguStatus = IuguService.getStatus(iuguInvoice.data.status);
  
        // Order invoice update          
        await this.updateOrderInvoide(order.id, iuguStatus.status, iuguStatus.message);

      } catch (error) {

        // invoice not found
        if(error.status == 404) await this.updateOrderInvoide(order.id, 'reprove', 'Fatura não encontrada');

      }
    }

    this.info({message: `[IuguInvoiceStatusTaks] finished, has found ${pendentOrders.length} orders`});
  }
  
  /**
   * Update order invoice
   * @param {number} id order invoice ID
   * @param {string} status send invoice status:: (reprove, approve, pending)
   * @param {string} message the message to save in invoice
   */
  async updateOrderInvoide(id, status, message = null) {
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    await OrderInvoice.query()
    .where('id', id)
    .update({
      status: status,
      creditCardMessage: message,
      updated_at: date
    });
  }
}

module.exports = IuguInvoiceStatusTask