const crypto = require('crypto')
const ULID = require('ulid')

const safeCompare = (a, b) => {
  return !!(
    a &&
    b &&
    a.length &&
    b.length &&
    (a.length === b.length) &&
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  )
}

const generateUUID = () => ULID.ulid()

module.exports = {
  safeCompare,
  generateUUID,
}
