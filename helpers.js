const crypto = require('crypto')

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

module.exports = {
  safeCompare,
}
