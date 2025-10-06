const axios = use('axios')

const sendNotification = function(data) {
  const headers = {
    "Content-type": "application/json; charset=utf-8",
    "Authorization": "Basic NGQ0YzI0MDUtODk2Zi00ZWJjLWE5ZDMtYjMwZDQxNGQ1YWJj"
  }

  const options = {
    host: "https://onesignal.com/api/v1/notifications",
    port: 443,
    method: "POST",
    headers
  }

  axios.post('https://onesignal.com/api/v1/notifications', data, options, headers).then((response) => {
    console.log(response.data);
  }).catch((error) => {
    console.log(error);
  })
}

module.exports = sendNotification;
