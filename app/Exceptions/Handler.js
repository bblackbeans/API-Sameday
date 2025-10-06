'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')
const ErrorController = make('App/Controllers/ErrorController')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, {
    request,
    response
  }) {
    const requestAccepts = request.accepts(['json'])
    if (requestAccepts == 'json') {
      if (error.code && error.code === 'ER_CON_COUNT_ERROR') {
        response.status(408)
        return response.json(ErrorController.error('error', '00004', null, 'Instabilidade de comunicação.'))
      } else if (error.name && error.name == 'TimeoutError') {
        response.status(408)
        return response.json(ErrorController.error('error', '00004', null, 'Instabilidade de comunicação.'))
      } else if (error.message == 'Unable to acquire a connection') {
        response.status(408)
        return response.json(ErrorController.error('error', '00005', null, 'Instabilidade de comunicação.'))
      } else if (error.name && error.name == 'TooManyRequests') {
        response.status(error.status)
        return response.json(ErrorController.error('error', '00003', [error.message], 'Tente ir um pouco mais devagar.'))
      } else if (error.code && error.code === 'E_INVALID_JWT_TOKEN') {
        response.status(error.status)
        return response.json(ErrorController.error('token', '00001', error, 'Token de acesso inválido, vencido ou não informado!'))
      } else if (error.code && error.code === 'E_JWT_TOKEN_EXPIRED') {
        response.status(error.status)
        return response.json(ErrorController.error('token', '00004', error, 'Clique no botão sair e faça novo login.'))
      } else if (error.code && error.code === 'E_INVALID_API_TOKEN') {
        response.status(error.status)
        return response.json(ErrorController.error('token', '00004', error, 'Clique no botão sair e faça novo login.'))
      } else if (error && error.name === 'TokenExpiredError') {
        response.status(error.status)
        return response.json(ErrorController.error('token', '00004', error, 'Clique no botão sair e faça novo login.'))
      } else if (error.code && error.code === 'E_PASSWORD_MISMATCH') {
        response.status(error.status)
        return response.json(ErrorController.error('user', '00004'))
      } else if (error.code && error.code === 'ER_BAD_FIELD_ERROR') {
        response.status(error.status)
        return response.json(ErrorController.error('error', '00002', [error.code], 'Caso erro persista, informe ao suporte SameDay!'))
      } else if (error.message == 'request.qs[key].trim is not a function') {
        response.status(400)
        return response.json(ErrorController.error('parametros', '00002'))
      } else if (error.status === 'error') {
        response.status(400)
        return response.json(error)
      } else {
        response.status(error.status)
        return response.json(ErrorController.error('error', '00001', error, error.message))
      }
    }

    return super.handle(...arguments)
  }
}

module.exports = ExceptionHandler
