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

const parseExtensionFromFilename = (filename) => {
  var ext = /^.+\.([a-zA-Z0-9]+)$/.exec(filename)
  return ext == null ? '' : ext[1].toLowerCase()
}

const objectSubset = (obj, keysToPick) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keysToPick.includes(key)),
  )
}

const isBlank = (str) => {
  return !str || /^\s*$/.test(str)
}

const isValidId = (uuid) => {
  // 26-40 alpha numberic and dashes
  // sids, uuids, ulids
  return (uuid || '').match(/^[a-zA-Z0-9-]{26,40}$/)
}

module.exports = {
  safeCompare,
  generateUUID,
  parseExtensionFromFilename,
  isBlank,
  objectSubset,
  isValidId,
}
