'use strict'

// Config
require('dotenv').config()
const axios = require('axios')

// Models
const Users = use('App/Models/Base/Users')

class SendSmsService {
  constructor() {
    this.sms = {
      api_key: process.env.SMS_API_KEY,
      api_url: process.env.SMS_API_URL
    }
  }

  /**
   * Send SMS
   * @param {number} _type // message type
   * @param {number} _idUser // User id in the base
   * @param {string} _msg // Message the user should receive
   * @param {string} _number // Number of the user who will receive the sms
   */
  async sendSMS(_idUser, _number, _msg, _type = 9) {
    const bodySend = {
      msg: _msg,
      type: _type,
      number: _number,
      key: this.sms.api_key,
    }

    const result = await axios.post(this.sms.api_url, bodySend)

    const {
      data
    } = result

    if (data.hasOwnProperty('erro')) {
      console.log('idUser: ' + _idUser, ', Não foi possível enviar a mensagem!, MSG: ' + _msg)
    } else {
      console.log('idUser: ' + _idUser, ', Mensagem enviada com sucesso!, MSG: ' + _msg)
    }
  }

  /**
   * Driver document validation alert
   * @param {number} _idUser User id in the base
   * @param {string} _reason Reason for failing or reviewing
   * @param {string} _action (Pending - Revision - Approved - Reproved)
   * @param {string} _category Document Type (cnhPhoto - driverPhoto - vehiclePhoto - antecedentPhoto - documentPhotoCRLV - photoOfProofOfAddress)
   */
  async driverValidationAlert(_idUser, _action, _category, _reason) {
    try {
      let msg = ''

      switch (_action) {
        case 'revision':
          switch (_category) {
            case 'cnhPhoto':
              msg = 'SameDay: Revisão de CNH. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'driverPhoto':
              msg = 'SameDay: Revisão de motorista. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'vehiclePhoto':
              msg = 'SameDay: Revisão de veículo. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'antecedentPhoto':
              msg = 'SameDay: Revisão de antecedentes. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'documentPhotoCRLV':
              msg = 'SameDay: Revisão documento (CRLV). ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'photoOfProofOfAddress':
              msg = 'SameDay: Revisão de endereço. ' + _reason + '. Envie os comprovantes novamente!'
              break;
          }
          break;
        case 'approved':
          switch (_category) {
            case 'cnhPhoto':
              msg = 'SameDay: Documentação de CNH aprovado!'
              break;
            case 'driverPhoto':
              msg = 'SameDay: Foto do motorista aprovado!'
              break;
            case 'vehiclePhoto':
              msg = 'SameDay: Foto do veículo aprovado!'
              break;
            case 'antecedentPhoto':
              msg = 'SameDay: Documentação de antecedentes aprovado!'
              break;
            case 'documentPhotoCRLV':
              msg = 'SameDay: Documentação (CRLV) aprovado!'
              break;
            case 'photoOfProofOfAddress':
              msg = 'SameDay: Documentação de endereço aprovado!'
              break;
          }
          break;
        case 'reproved':
          switch (_category) {
            case 'cnhPhoto':
              msg = 'SameDay: Documentação de CNH reprovado. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'driverPhoto':
              msg = 'SameDay: Foto do motorista reprovado. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'vehiclePhoto':
              msg = 'SameDay: Foto do veículo reprovado. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'antecedentPhoto':
              msg = 'SameDay: Documentação de antecedentes reprovado. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'documentPhotoCRLV':
              msg = 'SameDay: Documentação (CRLV) reprovado. ' + _reason + '. Envie os comprovantes novamente!'
              break;
            case 'photoOfProofOfAddress':
              msg = 'SameDay: Documentação de endereço reprovado. ' + _reason + '. Envie os comprovantes novamente!'
              break;
          }
          break;
      }

      if (_idUser) {
        const user = await Users.query()
          .where('id', _idUser)
          .select('id', 'phone', 'activatedUser')
          .first()

        if (user && user.activatedUser && user.phone) {
          this.sendSMS(_idUser, user.phone, msg)
        }
      }

    } catch (error) {
      throw error
    }
  }

  /**
   * Enable / Disable user registration for all SameDay platforms
   * @param {number} _idUser User id in the base
   * @param {boolean} _action (Enable / Disable) = TRUE or FALSE
   * @param {string} _number // Number of the user who will receive the sms
   */
  async enableDisableRegistration(_idUser, _number, _action) {
    try {
      let msg = ''

      if (_action) {
        msg = 'SameDay: Cadastro habilitado. Agora você tem acesso as nossas plataformas!'
      } else {
        msg = 'SameDay: Cadastro desativado. Procure o nosso suporte para mais informações!'
      }

      this.sendSMS(_idUser, _number, msg)

    } catch (error) {
      throw error
    }
  }
}

module.exports = new SendSmsService()
