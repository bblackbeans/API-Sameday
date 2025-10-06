'use strict'

require('dotenv').config()
const Logger = use('Logger')
const axios = require('axios')

const consoleColors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m"
}

class SharedService {
  constructor() {
    this.google = {
      google_api_key: process.env.GOOGLE_API_KEY,
      google_api_url: process.env.GOOGLE_API_URL
    }
  }

  /**
   * Get latitude and longitude through address
   *
   * @param {object} address
   */
  async getLatLngThroughAddress(address) {
    try {
      const ad = {
        city: address.city,
        state: address.state,
        number: address.number,
        address: address.address,
        zipCode: address.zipCode,
        district: address.district,
        complement: address.complement,
      }

      // const url = `${this.google.google_api_url}/geocode/json?address=${ad.address} ${ad.number},${ad.district},${ad.city},${ad.state},${ad.zipCode}&key=${this.google.google_api_key}`
      const url = `${this.google.google_api_url}/geocode/json?address=${this.removeSpecialChar(ad.address, false)},${this.removeSpecialChar(ad.district, false)}&key=${this.google.google_api_key}`;
      console.log(url);
      const response = await axios.get(url)

      return response.data
    } catch (error) {
      Logger.error('Error - Get latitude and longitude through address:', error)
    }
  }

  /**
   * Get address through latitude and longitude
   * @param {String} lat
   * @param {String} lng
   */
  async getAddressThroughLatLng(lat, lng) {
    try {
      const url = `${this.google.google_api_url}/geocode/xml?latlng=${lat},${lng}&key=${this.google.google_api_key}`
      const response = await axios.get(url)

      return response.data
    } catch (error) {
      Logger.error('Error - Get address through latitude and longitude:', error)
    }
  }

  /**
   * Convert value money BRL in float
   * @param {string} value Text money format BRL
   * @returns {float}
   */
  realToDecimal(value) {
    let v = 0;
    if (typeof (value) == 'string' && value.indexOf(',') != -1) {
      let v1 = value.split(',');
      let v2 = v1[0].replace('.', '') + '.' + v1[1];
      v = parseFloat(v2);
    } else if (typeof (value) == 'string') { 
      v = parseFloat(value);
    }
    return v;
  }

  /**
   * Convert valuet float in text format BRL money 
   * @param {float} value Float value
   * @returns {string}
   */
  decimalToReal(value) {
    value = value.toFixed(2).split('.');
    value[0] = "" + value[0].split(/(?=(?:...)*$)/).join('.');
    return value.join(',');
  }

  /**
   * Sanitize string data 
   * @param {string} str String for sanitize data
   * @param {boolean} remove_spaces Condition for remove white space
   * @param {boolean} unsensitive Condition for ignore sensitive case
   * @returns {string}
   */
  removeSpecialChar(str, remove_spaces = true, unsensitive = true) {
    var especial_char_a = unsensitive ? [/á/gi, /à/gi, /â/gi, /ã/gi] : [/á/g, /à/g, /â/g, /ã/g];
    var especial_char_e = unsensitive ? [/é/gi, /è/gi, /ê/gi, /ẽ/gi] : [/é/g, /è/g, /ê/g, /ẽ/g];
    var especial_char_i = unsensitive ? [/í/gi, /ì/gi, /î/gi, /ĩ/gi] : [/í/g, /ì/g, /î/g, /ĩ/g];
    var especial_char_o = unsensitive ? [/ó/gi, /ò/gi, /ô/gi, /õ/gi] : [/ó/g, /ò/g, /ô/g, /õ/g];
    var especial_char_u = unsensitive ? [/ú/gi, /ù/gi, /û/gi, /ũ/gi] : [/ú/g, /ù/g, /û/g, /ũ/g];
    var especial_char_cedil = unsensitive ? [/ç/gi] : [/ç/g];

    var especial_upper_char_a = [/Á/g, /À/g, /Â/g, /Ã/g];
    var especial_upper_char_e = [/É/g, /È/g, /Ê/g, /Ẽ/g];
    var especial_upper_char_i = [/Í/g, /Ì/g, /Î/g, /Ĩ/g];
    var especial_upper_char_o = [/Ó/g, /Ò/g, /Ô/g, /Õ/g];
    var especial_upper_char_u = [/Ú/g, /Ù/g, /Û/g, /Ũ/g];
    var especial_upper_char_cedil = [/Ç/g];

    var especial_caracter = [/[.]/g, /@/g, /\//g, /#/g, /\$/g, /%/g, /&/g, /\*/g, /\+/g, /\-/g, /=/g, /\(/g, /\)/g, /\?/g, /\\/g, /\|/g];

    function replaceArray(str, strReplace, arrayData) {
      arrayData.forEach(item => {
        str = str.replace(item, strReplace)
      });

      return str;
    }

    str = replaceArray(str, "", especial_caracter);

    str = replaceArray(str, "a", especial_char_a);
    str = replaceArray(str, "e", especial_char_e);
    str = replaceArray(str, "i", especial_char_i);
    str = replaceArray(str, "o", especial_char_o);
    str = replaceArray(str, "u", especial_char_u);
    str = replaceArray(str, "c", especial_char_cedil);

    if (!unsensitive) {
      str = replaceArray(str, "A", especial_upper_char_a);
      str = replaceArray(str, "E", especial_upper_char_e);
      str = replaceArray(str, "I", especial_upper_char_i);
      str = replaceArray(str, "O", especial_upper_char_o);
      str = replaceArray(str, "U", especial_upper_char_u);
      str = replaceArray(str, "C", especial_upper_char_cedil);
    }

    if (remove_spaces) {
      str = str.replace(/ /gi, "_");
    }

    return str;
  }

  /**
   * Return one string with the character increment with the size defined
   * @param {string} value The string to increment
   * @param {number} size The size to return string
   * @param {string} character The character to increment
   * @returns 
   */
  padStr(value, size, character = '0'){
    var s = String(value);
    while (s.length < (size || 2)) {s = character + s;}
    return s;
  }

  /**
   * Return future due date to invoice
   * @param {number} afterDays Quantity of days to set due date invoice
   */
  getInvoiceDueDate(afterDays = 7) {
    var date = new Date();
    date.setDate( date.getDate() + afterDays );

    return `${date.getFullYear()}-${this.padStr(date.getMonth() + 1)}-${this.padStr(date.getDate())}`
  }

  /**
   * Convert measure in the less measure
   * @param {number} value Value of measure
   * @param {string} measure Type of measure 
   * @returns {object}
   */
  convertMeasuere(value, measure) {

    let result = {
      text: '',
      value: 0,
      measure: ''
    };

    let factor = 0;
    let sufix = '';

    switch (measure.toLowerCase().trim()) {
      case 'centimetros':
        factor = 1;
        sufix = 'cm';
        break;
      case 'metros':
        factor = 100;
        sufix = 'cm';
        break;
      case 'quilogramas':
        factor = 1000;
        sufix = 'g';
        break;
      case 'gramas':
        factor = 1;
        sufix = 'g';
        break;
      default:
        break;
    }

    if(typeof(value) == "string") value = parseFloat(value.replace(/[aA-zZ]/gi, '').trim());

    if( value <= 0) {
      result.text = `${value} ${sufix}`;
      result.measure = `${sufix}`
      return result;
    }

    let convert = value * factor;
    result.text = `${this.decimalToReal(convert)} ${sufix}`;
    result.value = parseFloat(convert.toFixed(2));
    result.measure = `${sufix}`

    return result;
  }


  /**
   * Check if the box fits in the vehicle
   * @param {object} vehicle Object contains the size of vehicle 
   * @param {object} orderItem Object contains the size of order item
   * @returns {boolean}
   */
  isValidSizeToVehicle(vehicle, orderItem) {
    let vehicleData = this.normalizeMeasure(vehicle);
    let orderData = this.normalizeMeasure(orderItem);
    return orderData.order[0] <= vehicleData.order[0] && orderData.order[1] <= vehicleData.order[1] && orderData.order[2] <= vehicleData.order[2];
  }

  /**
   * Normalize measure
   * @param {object} item Object contains size of measure
   * @returns {object}
   */
  normalizeMeasure(item) {
    let itemData = {
      height: this.convertMeasuere(item.height, item.conversion_height),
      width: this.convertMeasuere(item.width, item.conversion_width),
      _length: this.convertMeasuere(item.length, item.conversion_length),
    };
    itemData.order = [ itemData.height.value, itemData.width.value, itemData._length.value ].sort((b,a) => a - b);
    return itemData;
  }

  /**
   * Get item volume
   * @param {object} item Object contains size
   * @returns {number}
   */
  getVolume(item) {
    return parseFloat((item.height.value * item.width.value * item._length.value).toFixed(2))
  }

  /**
   * Get Gmap distance to points
   * @param {string} origin Gmap origin option 
   * @param {string} destination Gmap destination option
   * @param {string} mode Gmap mode option 
   * @returns 
   */
   async getGmapDistance(origin, destination, mode = 'driving') {
    try {
      
      const url = `${this.google.google_api_url}/distancematrix/json?origins=${origin.trim()}&destinations=${destination.trim()}&mode=${mode.trim()}&key=${this.google.google_api_key.trim()}`;
      console.log(url);
      const response = await axios.get(url)
      // const response = { data: {"destination_addresses":["QR 423 Conjunto 11 Lote 24 Loja 01 - s/n - Samambaia Sul, Brasília - DF, 72325-200, Brazil","Q 1 Conjunto D1, 2 - Sobradinho, Brasília - DF, 73020-610, Brazil","70 - St. Leste Q 44 - Pte. Alta Norte (Gama), Brasília - DF, 70297-400, Brazil","Sle Q 44 Cq, 13 - Pte. Alta Norte (Gama), Brasília - DF, 72440-509, Brazil"],"origin_addresses":["Sle Q 44, 23 - Pte. Alta Norte (Gama), Brasília - DF, 70297-400, Brazil"],"rows":[{"elements":[{"distance":{"text":"25.1 km","value":25077},"duration":{"text":"29 mins","value":1718},"status":"OK"},{"distance":{"text":"82 m","value":82},"duration":{"text":"1 min","value":21},"status":"OK"},{"distance":{"text":"51.5 km","value":51454},"duration":{"text":"47 mins","value":2849},"status":"OK"},{"distance":{"text":"0.2 km","value":197},"duration":{"text":"1 min","value":84},"status":"OK"}]}],"status":"OK"}  };

      return response.data
    } catch (error) {
      Logger.error('Error - Get Gmap distance to points address:', error)
    }
  }

  /**
   * Get the date in brasilian format
   * @param {Date} vnow Date to convert 
   * @returns {string}
   */
  getDateTimeNow = (vnow = null) => {
    function AddZero(num) {
      return (num >= 0 && num < 10) ? "0" + num : num + "";
    }

    var now = vnow ? vnow : new Date();
    var strDateTime = [[AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("/"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(":")].join(" ");

    return strDateTime;
  }

  /**
   * Display log in terminal server
   * @param {string} message Message to display
   * @param {string} status Status of message
   */
  log = (message, status = "success") => {
    let msg = ``;
    let date = new Date();
    switch (status) {
      case "success":
        msg = (`${consoleColors.Bright}${consoleColors.FgYellow}[${this.getDateTimeNow()}:${this.padStr(date.getSeconds())}]${consoleColors.FgGreen}      `);
        break;
      case "info":
        msg = (`${consoleColors.Bright}${consoleColors.FgYellow}[${this.getDateTimeNow()}:${this.padStr(date.getSeconds())}]${consoleColors.FgCyan}      `);
        break;
      case "debug":
        msg = (`${consoleColors.Bright}${consoleColors.FgYellow}[${this.getDateTimeNow()}:${this.padStr(date.getSeconds())}]${consoleColors.FgBlue}      `);
        break;
      case "warning":
        msg = (`${consoleColors.Bright}${consoleColors.FgYellow}[${this.getDateTimeNow()}:${this.padStr(date.getSeconds())}]${consoleColors.FgYellow}      `);
        break;
      case "danger":
        msg = (`${consoleColors.Bright}${consoleColors.FgYellow}[${this.getDateTimeNow()}:${this.padStr(date.getSeconds())}]${consoleColors.FgRed}      `);
        break;
      default:
        msg = (`${consoleColors.Bright}${consoleColors.FgYellow}[${this.getDateTimeNow()}:${this.padStr(date.getSeconds())}]${consoleColors.FgWhite}      `);
        break;
    }

    if (typeof (message) == "string") {
      msg += `${message}${consoleColors.Reset}`;
      console.log(msg);
    } else {
      msg += `${consoleColors.Reset}`;
      console.log(msg, message);
    }
  }

  /**
   * Get time difference in hours 
   * @param {Date} dt2 The less then date
   * @param {Date} dt1 The greater then date
   * @returns {number}
   */
  diffHours(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff));
  }

}

module.exports = new SharedService()
