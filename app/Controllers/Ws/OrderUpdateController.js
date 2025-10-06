'use strict'
const Users = use('App/Models/Base/Users')

const Ws = use('Ws')
class OrderUpdateController {
  constructor({
    socket,
    request
  }) {
    this.socket = socket
    this.request = request
  }

  async onMessage({
    userId,
    lat,
    lng
  }) {
    await Users.query()
      .where('id', userId)
      .update({
        lat,
        lng
      })
  }
}

module.exports = OrderUpdateController
