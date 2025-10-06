'use strict'

// Services
/** @type {import('../../Services/Shared')} */
const SharedService = use('App/Services/Shared')

// Models
const UserBank = use('App/Models/Base/UserBank')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')
/** @type {import('../SharedController')} */
const SharedController = make('App/Controllers/Http/SharedController')

const moment = require('moment')

class UserBankController { 

  /**
   * GET /user-bank/list
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getUserBankList({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    
    /** Get and check required fields */
    const {
      idUser,
    } = request.get();

    /** Get and check authenticate user */
    const authenticateUser = await SharedController.getAuthenticateUser(auth);
    if (!authenticateUser) {
      response.status(404)
      return response.json(ErrorController.error('user', '00001', null))
    }

    let idUsuario = idUser;
    if (authenticateUser.profile != "administrator") {
      idUsuario = authenticateUser.id
    }

    var list = [];

    try {
      list = (await UserBank.query()
          .where('idUser', idUsuario)
          .fetch()).toJSON();
          
    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: '',
      data: list
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * PUT /user-bank/:id
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async putUserBank({
    ctx,
    auth,
    params,
    request,
    response
  }) {

    const{
      id
    } = params
    
    /** Get and check required fields */
    if (!request.raw()) {
      response.status(400)
      return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
    }

    let bodyData = request.input('params');

    if (!bodyData) {
      bodyData = request.post()
    }

    /** Get and check authenticate user */
    const authenticateUser = await SharedController.getAuthenticateUser(auth);
    if (!authenticateUser) {
      response.status(404)
      return response.json(ErrorController.error('user', '00001', null))
    }

    const {
      bank,
      agency,
      account,
      accountDigit,
      idUser
    } = bodyData

    let exists = await UserBank.query()
        .where('id', id)
        .where('idUser', idUser)
        .first()

    if (!exists) {
      response.status(404)
      return response.json(ErrorController.error('userBank', '00001'))
    }

    const date = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
      
      await UserBank.query()
        .where('id', id)
        .update({
          bank: bank,
          agency: agency,
          account: account,
          accountDigit: accountDigit,
          updated_at: date
        })
          
    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: 'Data update success',
      data: null
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * POST /user-bank
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async postUserBank({
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

    let bodyData = request.input('params');

    if (!bodyData) {
      bodyData = request.post()
    }

    if (!request.raw() || !bodyData ) {
      response.status(400)
      return response.json(ErrorController.error('parameters', '00003', null, 'Parâmetros inválidos!'))
    }

    let idUser = 0
    if (authenticateUser.profile != "administrator") {
      idUser = authenticateUser.id
    }

    const {
      bank,
      agency,
      account,
      accountDigit,
    } = bodyData

    var data = null;

    try {
      
      const date = moment().format('YYYY-MM-DD HH:mm:ss')
      data = await UserBank.create({
        bank: bank,
        agency: agency,
        account: account,
        accountDigit: accountDigit,
        idUser: idUser,

        created_at: date,
        updated_at: date,
      })
          
    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: '',
      data: data
    }

    response.status(200)
    response.json(objReturn)
  }

  /**
   * DELETE /user-bank/:id
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {params} ctx.params
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async deleteUserBank({
    ctx,
    auth,
    params,
    request,
    response
  }) {
    
    /** Get and check required fields */
    const {
      id,
    } = params;

    /** Get and check authenticate user */
    const authenticateUser = await SharedController.getAuthenticateUser(auth);
    if (!authenticateUser) {
      response.status(404)
      return response.json(ErrorController.error('user', '00001', null))
    }

    let idUser = 0;
    if (authenticateUser.profile != "administrator") {
      idUser = authenticateUser.id
    }

    try {
      await UserBank.query()
          .where('idUser', idUser)
          .where('id', id)
          .delete();
          
    } catch (error) {
      SharedService.log(error);
    }

    const objReturn = {
      status: 'success',
      message: 'Data remove success',
      data: null
    }

    response.status(200)
    response.json(objReturn)
  }

}

module.exports = UserBankController