const axios = require('axios');

const url_status_invoice = `https://api-v2-sameday.herokuapp.com/v2/schedule/status-invoice`;
const url_driver_raffle = `https://api-v2-sameday.herokuapp.com/v2/schedule/driver-raffle`;

axios.get(url_status_invoice).then( (resp) => {
  console.log(resp);
} ).catch( (error) => {
  console.error(error);
});

axios.get(url_driver_raffle).then( (resp) => {
  console.log(resp);
} ).catch( (error) => {
  console.error(error);
});
