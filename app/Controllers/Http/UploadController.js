'use strict'

/** @typedef {import('@adonisjs/auth/src/Schemes/Jwt')} Auth */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// Models
const Documents = use('App/Models/Base/Documents')

// Services
/** @type {import('../../Services/Cloudinary')} */
const Cloudinary = use('App/Services/Cloudinary')

/** @type {import('../ErrorController')} */
const ErrorController = make('App/Controllers/ErrorController')
class UploadController {
  constructor() {}

  /**
   * Create a new upload.
   * Post /upload
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async upload({
    request,
    response
  }) {
    try {

      let bodyData = request.input('params')

      if (!bodyData) {
        bodyData = request.post()
      }

      const {
        url
      } = bodyData

      if (!url) {
        response.status(404)
        return response.json(ErrorController.error('upload', '00003'))
      }

      let resultCloudinary = await Cloudinary.upload(url)

      const objReturn = {
        status: 'success',
        data: resultCloudinary
      }

      response.status(200)
      response.json(objReturn)

    } catch (error) {
      response.status(500)
      return response.json(ErrorController.error('upload', '00002', error.message))
    }
  }

  /**
   * Post /destroy
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async destroy({
    request,
    response
  }) {
    try {

      let public_ids = request.input('params')

      if (!public_ids) {
        public_ids = request.post()
      }

      if (!public_ids.length) {
        response.status(404)
        return response.json(ErrorController.error('upload', '00001'))
      }

      let resultCloudinary = await Cloudinary.destroy(public_ids)

      // Remove from Documents table
      await Documents.query().whereIn('idCloudinary', public_ids).delete()

      const objReturn = {
        status: 'success',
        data: resultCloudinary
      }

      response.status(200)
      response.json(objReturn)

    } catch (error) {
      response.status(500)
      return response.json(ErrorController.error('upload', '00002', error.message))
    }
  }
}

module.exports = UploadController
