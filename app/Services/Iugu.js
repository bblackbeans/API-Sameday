'use strict'

require('dotenv').config()
const axios = require('axios')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid');

const IUGU_URL = process.env.IUGU_URL;
const IUGU_TOKEN = process.env.IUGU_AUTH_TOKEN;

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

// Models
const OrderInvoice = use('App/Models/Base/OrderInvoice');
const Orders = use('App/Models/Base/Orders')

const defaulHeardersIugu = {
  headers: {
    'Authorization': IUGU_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

module.exports = {

  /**
   * Make request IUGU to payment PIX
   * @param {object} order Order item with items object
   * @param {object} payer User payment with address object
   * @returns 
   */
  createPix: async (order, payer) => {
    return new Promise(async (resolve, reject) => {
      try {

        /** Check data user payment */
        if(!payer || 
          !payer.address || 
          !payer.address.zipCode || 
          !payer.address.address || 
          !payer.address.number || 
          !payer.address.city ||  
          !payer.address.state ||
          !payer.address.district ) {
            reject("Endereço do usuário incompleto")
          }

        if(!payer.cpfcnpj || !payer.email || !payer.name ) reject("Dados do usuário incompleto");
        
        /** Check items order */
        if(!order || !order.items || !order.items.length ) reject("Dados dos item do pedido estão incompletos");

        const payloadPayer = {
          address: {
              zip_code: payer.address.zipCode,
              street: payer.address.address,
              number: payer.address.number,
              city: payer.address.city,
              state: payer.address.state,
              district: payer.address.district,
              country: "BR",
              complement: payer.address.complement,
          },
          cpf_cnpj: payer.cpfcnpj,
          name: payer.name,
          email: payer.email
        }

        /** implements in the future */
        // var items = [];
        // order.items.forEach(item => items.push({
        //   description: `${item.name} - ${item.width}x${item.height}`,
        //   quantity: parseInt(item.quantity),
        //   price_cents: 0
        // }) );

        var customer_order_id = uuidv4();

        const payload = {
          payer: payloadPayer,
          payable_with: [ "pix" ],
          email: payer.email,
          due_date: SharedService.getInvoiceDueDate(),
          order_id: customer_order_id,
          items: [
            {
              description: `SAMEDAY ORDER ID ${order.id}`,
              quantity: 1,
              price_cents: parseInt(order.price.replace(/[,.]/gi, ''))
            }
          ]
        }

        var responseIugu = await axios.post( `${IUGU_URL}/invoices`, payload, defaulHeardersIugu ).then(x => x.data);
        
        const date = moment().format('YYYY-MM-DD HH:mm:ss')

        // Create order invoice with the data IUGU
        await OrderInvoice.create({
          method: "pix",
          value: order.price,
          pixQRCode: responseIugu.pix.qrcode,
          pixQRCodeText: responseIugu.pix.qrcode_text,
          providerPaymentId: responseIugu.id,
          providerCustomerId: customer_order_id,
          status: responseIugu.status,
          idOrder: order.id,
          idUser: order.idUser,
          creditCardStatus:  null,
          creditCardMessage: null,
          created_at: date,
          updated_at: date
        });

        resolve({
          status: true,
          url: responseIugu
        })
      } catch (error) {
        console.log(error);
        reject({
          status: false,
          url: error.message
        })
      }
    })
  },

  /**
   * Make request IUGU to payment credit card
   * @param {string} creditCardToken Token credit card generate to user application
   * @param {object} order Order item with items object
   * @param {object} payer User payment with address object
   * @returns 
   */
  payCreditCard: async (creditCardToken, order, payer) => {
    return new Promise(async (resolve, reject) => {
      try {

        /** Check data user payment */
        if(!payer || 
          !payer.address || 
          !payer.address.zipCode || 
          !payer.address.address || 
          !payer.address.number || 
          !payer.address.city ||  
          !payer.address.state ||
          !payer.address.district ) {
            reject("Endereço do usuário incompleto")
          }

        if(!payer.cpfcnpj || !payer.email || !payer.name ) reject("Dados do usuário incompleto");
        
        /** Check items order */
        if(!order || !order.items || !order.items.length ) reject("Dados dos item do pedido estão incompletos");

        const payloadPayer = {
          address: {
              zip_code: payer.address.zipCode,
              street: payer.address.address,
              number: payer.address.number,
              city: payer.address.city,
              state: payer.address.state,
              district: payer.address.district,
              country: "BR",
              complement: payer.address.complement,
          },
          cpf_cnpj: payer.cpfcnpj,
          name: payer.name,
          email: payer.email
        }

        /** implements in the future */
        // var items = [];
        // order.items.forEach(item => items.push({
        //   description: `${item.name} - ${item.width}x${item.height}`,
        //   quantity: parseInt(item.quantity),
        //   price_cents: 0
        // }) );

        var customer_order_id = uuidv4();

        const payload = {
          token: creditCardToken,
          payer: payloadPayer,
          email: payer.email,
          order_id: customer_order_id,
          items: [
            {
              description: `SAMEDAY ORDER ID ${order.id}`,
              quantity: 1,
              price_cents: parseInt(order.price.replace(/[,.]/gi, ''))
            }
          ]
        }

        var responseIugu = await axios.post( `${IUGU_URL}/charge`, payload, defaulHeardersIugu ).then(x => x.data);

        const date = moment().format('YYYY-MM-DD HH:mm:ss')

        // Create order invoice with the data IUGU
        await OrderInvoice.create({
          method: "creditcard",
          value: order.price,
          pixQRCode: null,
          pixQRCodeText: null,
          providerPaymentId: responseIugu.invoice_id,
          providerCustomerId: customer_order_id,
          status: responseIugu.success ? 'approve' : 'reprove',
          idOrder: order.id,
          idUser: order.idUser,
          creditCardStatus:  responseIugu.success,
          creditCardMessage: responseIugu.message,
          created_at: date,
          updated_at: date
        });

          
        if(responseIugu.success){
          // Order
          await Orders.query()
          .where('id', order.id)
          .update({
            status: 'execution',
            updated_at: date
          });
        }

        resolve({
          status: true,
          url: responseIugu
        })
      } catch (error) {
        console.log(error);
        reject({
          status: false,
          url: error.message
        })
      }
    })
  },

  /**
   * Refund on one invoice
   * @param {string} invoiceId Iugu invoice id
   * @returns {object}
   */
  invoiceRefund: async (invoiceId) => {
    return new Promise(async ( resolve, reject ) => {
      if(!invoiceId) reject('Invoice ID is empty');

      try {
        var responseIugu = await axios.post( `${IUGU_URL}/invoices/${invoiceId}/refund`, {}, defaulHeardersIugu ).then(x => x.data);
        resolve({ status: true, data: responseIugu });
      } catch (error) {
        reject( { response: error.response.data, status: error.response.status, config: error.response.config } );
      }
    });
  },

  /**
   * Get invoice data of the Iugu
   * @param {string} invoiceId Iugu invoice ID
   */
  getInvoice: async( invoiceId ) => {
    return new Promise(async ( resolve, reject ) => {
      if(!invoiceId) reject('Invoice ID is empty');

      try {
        var responseIugu = await axios.get( `${IUGU_URL}/invoices/${invoiceId}`, defaulHeardersIugu ).then(x => x.data);
        resolve({ status: true, data: responseIugu });
      } catch (error) {
        reject( { response: error.response.data, status: error.response.status, config: error.response.config } );
      }
    });
  },

  /**
   * Get Iugu status message
   * @param {string} status Iugu status code
   * @returns {object}
   */
  getStatus: (status) => {
    const invoiceStatus = {
      pending: { status:'pending', message:'A fatura ainda não foi paga' },
      paid: { status:'approve', message:'Pagamento confirmado' },
      canceled: { status:'reprove', message:'Fatura cancelada' },
      in_analysis: { status:'reprove', message:'Fatura em análise' },
      draft: { status:'reprove', message:'Fatura não gerada' },
      partially_paid: { status:'reprove', message:'Fatura não paga em seu valor total' },
      refunded: { status:'refunded', message:'Fatura estornada ao cliente' },
      expired: { status:'reprove', message:'Fatura foi cancelada por ultrapassar o tempo limite de espera' },
      in_protest: { status:'reprove', message:'Fatura paga sinalizada como não reconhecida pelo cliente' },
      chargeback: { status:'reprove', message:'Fatura sinalizada como não reconhecida pelo cliente estornada' },
    }

    return invoiceStatus[status];
  }
}
