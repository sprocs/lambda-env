const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
const PNF = require('google-libphonenumber').PhoneNumberFormat

const parsePhoneNumber = (phoneNumberStr) => {
  try {
    return phoneUtil.parse(phoneNumberStr, 'US')
  } catch (e) {
    console.error(e)
    return null
  }
}

const formatE164 = (phoneNumberStr) => {
  try {
    const tel = parsePhoneNumber(phoneNumberStr)
    return phoneUtil.format(tel, PNF.E164)
  } catch (e) {
    console.error(e)
    return null
  }
}

const isValidPhoneNumber = (phoneNumberStr) => {
  try {
    var tel = phoneUtil.parse(phoneNumberStr, 'US')
    return phoneUtil.isValidNumber(tel)
  } catch (e) {
    console.error(e)
    return false
  }
}

module.exports = {
  formatE164,
  parsePhoneNumber,
  isValidPhoneNumber,
}
