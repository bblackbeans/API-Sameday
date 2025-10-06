module.exports = {
  sendNotification: (data) => {
    data.app_id = process.env.ONE_SIGNAL_APP_ID

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${process.env.ONE_SIGNAL_KEY}`
    }

    const options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    }

    const https = require('https')
    const req = https.request(options, (res) => {
      res.on('data', (data) => {
        console.log("Response: ", JSON.parse(data))
      })
    })

    req.on('error', (e) => {
      console.log("ERROR:")
      console.log(e)
    })

    req.write(JSON.stringify(data))
    req.end()
  },

}
  