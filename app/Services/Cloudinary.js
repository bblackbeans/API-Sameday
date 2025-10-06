'use strict'

require('dotenv').config()
const cloudinary = require('cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = {
  upload: async file => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await cloudinary.v2.uploader.upload(file)

        resolve({
          status: true,
          url: response
        })
      } catch (error) {
        reject({
          status: false,
          url: error.message
        })
      }
    })
  },

  destroy: async public_ids => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await cloudinary.v2.api.delete_resources(public_ids, {
          invalidate: true
        })

        resolve({
          status: true,
          url: response
        })
      } catch (error) {
        reject({
          status: false,
          url: error.message
        })
      }
    })
  }
}
