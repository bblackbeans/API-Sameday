const moment = require('moment')

function validateCPF(_cpf) {
  let value = _cpf
  if (!value || value === true) {
    return
  }

  if (typeof value === 'number') {
    value = String(value)
  }

  const cleanCPF = value.replace(/[^0-9]/g, '')
  const firstNineDigits = cleanCPF.substring(0, 9)
  const checker = cleanCPF.substring(9, 11)

  if (cleanCPF?.length !== 11) {
    return false
  }

  // Checking if all digits are equal
  for (let i = 0; i < 10; i++) {
    if ('' + firstNineDigits + checker === Array(12).join(String(i))) {
      return false
    }
  }

  let sum = null
  for (let j = 0; j < 9; ++j) {
    sum += firstNineDigits.toString().charAt(j) * (10 - j)
  }

  const lastSumChecker1 = sum % 11
  const checker1 = lastSumChecker1 < 2 ? 0 : 11 - lastSumChecker1

  const cpfWithChecker1 = (firstNineDigits + checker1)
  sum = null
  for (let k = 0; k < 10; ++k) {
    sum += cpfWithChecker1.toString().charAt(k) * (11 - k)
  }

  const lastSumChecker2 = sum % 11
  const checker2 = lastSumChecker2 < 2 ? 0 : 11 - lastSumChecker2

  if (checker.toString() === checker1.toString() + checker2.toString()) {
    return true
  } else {
    return false
  }
}

function validateEmail(_email) {
  const regExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const regExp2 = /[ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ]/

  return regExp.test(String(_email).toLowerCase()) && !regExp2.test(String(_email).toLowerCase())
}

function validateNameFull(_name) {
  if (_name) {
    const exp = _name.split(' ')
    return exp?.length <= 1 ? false : true
  } else {
    return false
  }
}

function validateZipCode(_zipCode) {
  return (_zipCode && _zipCode?.length === 8)
}

function validatePhone(_phone) {
  return _phone && (_phone?.length === 10 || _phone?.length === 11)
}

function validateStrongPassword(_password) {
  if (!_password) {
    return false
  }

  const seq = ['012', '123', '234', '345', '456', '567', '678', '789']
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{6,}/;

  let strong = true

  if (!_password.match(/[\w+]/)) {
    strong = false
  } else if (!_password.match(/[\d+]/)) {
    strong = false
  }

  seq.forEach(s => {
    if (_password.indexOf(s) > -1) {
      strong = false
    }
  })

  if (_password?.length < 6) {
    strong = false
  }

  if (!regExp.test(_password)) {
    strong = false
  }

  return strong
}

/**
 * Checks if an initial data is greater than an ending, returning true or false
 */
function startGreaterThanEndDate(_dataInicial, _dataFinal) {
  return moment(_dataInicial).diff(moment(_dataFinal)) > 0;
}

function removeSpecialCharacters(_value) {
  if (!_value) {
    return
  }

  return _value.replace(/[^a-z0-9]/gi, '')
}

function handleRebaseAddress(_addressFromSearch) {
  return {
    zipCode: _addressFromSearch.cep,
    city: _addressFromSearch.localidade,
    address: _addressFromSearch.logradouro,
    state: _addressFromSearch.uf,
    complement: _addressFromSearch.complemento,
    district: _addressFromSearch.bairro
  }
}

module.exports = {
  validateCPF,
  validatePhone,
  validateEmail,
  validateZipCode,
  validateNameFull,
  handleRebaseAddress,
  validateStrongPassword,
  startGreaterThanEndDate,
  removeSpecialCharacters
}